import {
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    EventEmitter } from "@angular/core";
import { Hardware } from "src/app/services/device/hardware-features/hardware-feature.service";
import { MapPlaceModel } from "src/app/services/learnplace/block.model";
import { Logger } from "src/app/services/logging/logging.api";
import { Logging } from "src/app/services/logging/logging.service";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl"
import { Geolocation } from "src/app/services/device/geolocation/geolocation.service";

/**
 * Describes coordinates by longitude and latitude.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface GeoCoordinate {
    readonly longitude: number,
    readonly latitude: number
}

/**
 * Describes options for the camera positon on a map.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface CameraOptions {
    readonly zoom?: number
    readonly position: GeoCoordinate
}

/**
 * Specific error, if the {@link MapService} is not used properly.
 * Indicates a wrong or missing used option.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class MapEvaluationError extends Error {

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, MapEvaluationError.prototype);
    }
}

enum ERRORS {
    NONE = 0,
    CONNECTION,
    GPS
}

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
    @Input("places") places: Array<MapPlaceModel> = [];
    @Input("selected") selected: number = 0;
    @Input("showFullscreen") showFullscreen: boolean = false;


    @Output("clickedPlace") clickedPlace = new EventEmitter<MapPlaceModel>();
    @Output("fullscreen") clickedFullscreen = new EventEmitter<boolean>();

    @ViewChild("map") elMap: HTMLElement;


    private readonly DEFAULT_ZOOM: number = 13;
    private readonly log: Logger = Logging.getLogger(MapComponent.name);

    private _selectedPlace: MapPlaceModel;
    private objIdMarker: Map<number, HTMLElement> = new Map<number, HTMLElement>();
    private mapboxMap: mapboxgl.Map;
    private buildFlag: boolean = false;

    fullscreen: boolean = false;
    map: MapPlaceModel | undefined = undefined;
    hasError: ERRORS = ERRORS.NONE;

    get selectedPlace(): MapPlaceModel {
        return this._selectedPlace;
    }

    set selectedPlace(place: MapPlaceModel) {
        if (!this.mapboxMap)
            return;

        if (this._selectedPlace)
            this.renderer.removeClass(this.objIdMarker.get(this._selectedPlace.id), "selected");

        if (!place.visible)
            return;

        this.renderer.addClass(this.objIdMarker.get(place.id), "selected");
        this.mapboxMap.flyTo({
            center: [place.longitude, place.latitude]
        });

        this._selectedPlace = place;
    }

    constructor(
        private readonly hardware: Hardware,
        private readonly detectorRef: ChangeDetectorRef,
        private readonly renderer: Renderer2,
        private readonly geolocation: Geolocation
    ) { }

    async ngOnInit(): Promise<void> {
        await this.hardware.requireLocation()
            .onFailure(() => this.hasError = ERRORS.GPS)
            .check();

        this.clickedFullscreen.subscribe(async (res) => {
            await this.delay(420); // must be a littlebit higher than the transition time of expanding parent element
            this.mapboxMap.resize();
        });
    }

    async ngOnChanges(): Promise<void> {
        if (this.buildFlag)
            return;

        if (!this.selected)
            return;
        else if (!this.places)
            return;

        await this.initMap(this.selected);
        this.buildFlag = true;
    }

    ngOnDestroy(): void {
        if (!!this.elMap) {
            while (this.elMap.firstChild) {
                this.elMap.removeChild(this.elMap.firstChild);
            }
        }

        this.buildFlag = false;
    }

    private async initMap(placeId: number): Promise<void> {
        this.detectorRef.detectChanges();
        /*
         * Only build map if its visible.
         * Otherwise the builder will fail, because there
         * is no html element to bind.
         */
        const selectedPlace: MapPlaceModel = this.places.find(place => {
            return place.id == placeId
        });

        // settings
        const camera: CameraOptions = <CameraOptions>{
            zoom: selectedPlace.zoom,
            position: <GeoCoordinate>{
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude
            }
        };

        this.mapboxMap = new mapboxgl.Map({
            container: "map",
            center: [camera.position.longitude, camera.position.latitude],
            style: "mapbox://styles/mapbox/streets-v9",
            zoom: camera.zoom,
            interactive: true
        });

        // controls
        this.mapboxMap.addControl(new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));

        this.mapboxMap.addControl(new mapboxgl.NavigationControl({
            showCompass: true,
            showZoom: true
        }));

        // markers
        const markers: Array<mapboxgl.Marker> = this.places
            .filter(place => place.visible)
            .map(place => {
                const el: HTMLElement = this.renderer.createElement("div") as HTMLElement;
                this.renderer.addClass(el, "marker");
                this.objIdMarker.set(place.id, el);

                el.addEventListener("click", e => {
                    this.clickedPlace.emit(place);
                });

                return new mapboxgl.Marker(el)
                    .setLngLat(new mapboxgl.LngLat(place.longitude, place.latitude))
                    .addTo(this.mapboxMap);
            });


        // select a marker
        this.selectedPlace = selectedPlace;

        if (!selectedPlace.visible) {
            this.mapOverview();
        }
    }

    async mapOverview(): Promise<void> {
        if (this.places.filter(lp => lp.visible).length <= 0) {
            const coords = (await this.geolocation.getCurrentPosition()).coords

            this.mapboxMap.flyTo({
                center: [coords.longitude, coords.latitude],
                zoom: 16
            });

            return;
        } else if (this.places.filter(lp => lp.visible).length <= 1) {
            this.mapboxMap.flyTo({
                center: [this.places[0].longitude, this.places[0].latitude],
                zoom: 16
            });

            return;
        }

        const sortedByLong: Array<MapPlaceModel> = this.places
            .filter(place => place.visible)
            .sort((a, b) => b.longitude - a.longitude);
        const sortedByLat: Array<MapPlaceModel> = this.places
            .filter(place => place.visible)
            .sort((a, b) => b.latitude - a.latitude);

        const bound: Array<[number, number]> = [
            this.places
                .map(place => {
                    return [
                        sortedByLong[0].longitude,
                        sortedByLat[0].latitude
                    ]})[0] as [number, number],
            this.places
                .map(place => {
                    return [
                        sortedByLong.reverse()[0].longitude,
                        sortedByLat.reverse()[0].latitude
                    ]})[0] as [number, number]
        ];

        // 10% of the distance between two points
        const margin: number = Math.sqrt(Math.pow(bound[0][0] - bound[1][0], 2) + Math.pow(bound[0][1] - bound[1][1], 2)) / 10;

        bound[0] = bound[0].map(val => val + margin) as [number, number];
        bound[1] = bound[1].map(val => val - margin) as [number, number];

        this.mapboxMap.fitBounds(bound as LngLatBoundsLike);
    }

    toggleFullscreen(): void {
        this.fullscreen = !this.fullscreen;
        this.clickedFullscreen.emit(this.fullscreen);
    }

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
