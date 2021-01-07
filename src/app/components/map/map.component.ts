import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { Hardware } from 'src/app/services/device/hardware-features/hardware-feature.service';
import { MapPlaceModel } from 'src/app/services/learnplace/block.model';
import { MapService, MAP_SERVICE } from 'src/app/services/learnplace/map.service';
import { Logger } from 'src/app/services/logging/logging.api';
import { Logging } from 'src/app/services/logging/logging.service';
import mapboxgl from "mapbox-gl"

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
 * Describes a marker that can be placed on a map.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface Marker {
    readonly title: string,
    readonly snippet: string,
    readonly position: GeoCoordinate
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
 * Describes a standard map that is used in the map service.
 * It exposes allowed method from the current map implementation and hides methods
 * that should not be used directly and only be accessed via
 * the {@link MapService}.
 *
 * @author nmaerchy <nm@studer-raimann.ch> | nschaefli <ns@studer-raimann.ch>
 * @version 2.0.0
 */
export interface StandardMap {

    readonly container: HTMLElement

    animateCameraZoomIn(): Promise<void>

    animateCameraZoomOut(): Promise<void>
}

/**
 * {@link MapboxMapBinding} is a abstraction from the {@link mapboxgl}.
 * Its used as a wrapper class, because some methods of the mapbox map
 * should only be accessed via the {@link MapService}.
 *
 * Methods are delegated to the given {@code map} instance.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 * @since 3.0.2
 */
class MapboxMapBinding implements StandardMap {
    constructor(
        private readonly map: mapboxgl.Map
    ) {}

    animateCameraZoomIn(): Promise<void> {
        this.map.zoomIn();
        return Promise.resolve();
    }

    animateCameraZoomOut(): Promise<void> {
        this.map.zoomOut();
        return Promise.resolve();
    }

    get container(): HTMLElement {
        return this.map.getContainer();
    }
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

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
    @Input("places") places: Array<MapPlaceModel>;
    @Input("selected") selected: MapPlaceModel;

    @ViewChild("map") mapElement: ElementRef;

    map: MapPlaceModel | undefined = undefined;

    private readonly DEFAULT_ZOOM: number = 13;
    private readonly log: Logger = Logging.getLogger(MapComponent.name);

    private mapPlaceSubscription: Subscription | undefined = undefined;

    private cameraPosition?: CameraOptions;
    private markerOptions?: Marker;
    private placeOptions?: Array<MapPlaceModel>
    private binding?: string | HTMLElement;
    private mapboxMap: mapboxgl.Map;

    constructor(
        private readonly hardware: Hardware,
        private readonly nav: NavController,
        private readonly detectorRef: ChangeDetectorRef,
        @Inject(MAP_SERVICE) private readonly mapService: MapService
    ) { }

    async ngOnInit(): Promise<void> {
        console.error("inside mapcomponent")

        await this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();
    }

    async ngOnChanges(): Promise<void> {
        console.error(this.places);
        console.error(this.selected);

        if (!this.selected) {
            // TODO error
            return;
        } else if (!this.places) {
            this.places = [this.selected];
        }
        await this.initMap(this.selected);

    }

    ngOnDestroy(): void {
        if (this.mapPlaceSubscription) this.mapPlaceSubscription.unsubscribe();

        if (!!this.mapElement) {
            while (this.mapElement.nativeElement.firstChild) {
                this.mapElement.nativeElement.removeChild(this.mapElement.nativeElement.firstChild);
            }
        }
    }

    private async initMap(place: MapPlaceModel): Promise<void> {
        this.detectorRef.detectChanges();
        console.error("building map");
        console.error(this.mapElement);
        /*
         * Only build map if its visible.
         * Otherwise the builder will fail, because there
         * is no html element to bind.
         */
        if(place.visible) {
            const camera: CameraOptions = <CameraOptions>{
                zoom: place.zoom,
                position: <GeoCoordinate>{
                    latitude: place.latitude,
                    longitude: place.longitude
                }
            };

            const marker: Marker = <Marker>{
                position: <GeoCoordinate>{
                    latitude: place.latitude, longitude: place.longitude
                },
                title: "1"
            };

            this.mapboxMap = new mapboxgl.Map({
                container: "map",
                center: [camera.position.longitude, camera.position.latitude],
                style: "mapbox://styles/mapbox/streets-v9",
                zoom: camera.zoom,
                interactive: true
            });

            this.mapboxMap.addControl(new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }));
            // Add geolocate control to the map.
            this.mapboxMap.addControl(new mapboxgl.NavigationControl({
                showCompass: true,
                showZoom: true
            }));

            this.mapboxMap.addControl(new mapboxgl.FullscreenControl());

            this.mapboxMap.once("load", () => {
                this.mapboxMap.loadImage(
                    "assets/icon/map_marker_001.png",
                    (error, image) => {
                    if (error) throw error;
                    const imageName: string = "learnplace";
                    this.mapboxMap.addImage(imageName, image);
                    this.mapboxMap.addLayer({
                        id: "points",
                        type: "symbol",
                        source: {
                            type: "geojson",
                            data: <GeoJSON.FeatureCollection<GeoJSON.Geometry>>{
                                type: "FeatureCollection",
                                features: [{
                                    type: "Feature",
                                    geometry: {
                                        type: "Point",
                                        coordinates: [marker.position.longitude, marker.position.latitude]
                                    }
                                }]
                            }
                        },
                        layout: {
                            "icon-image": imageName,
                            "icon-size": 0.25
                        }
                    });
                });
            });

            this.places.filter((place: MapPlaceModel) =>
                place.visible &&
                !(place.latitude === marker.position.latitude && place.longitude === marker.position.longitude)
            )
            .forEach((place: MapPlaceModel, i: number) => {
                console.error(place);
                this.mapboxMap.loadImage(
                    "assets/icon/map_marker_001.png",
                    (error, image) => {
                    if (error) throw error;
                    const imageName: string = i.toString();
                    this.mapboxMap.addImage(imageName, image);
                    this.mapboxMap.addLayer({
                        id: "points-" + i,
                        type: "symbol",
                        source: {
                            type: "geojson",
                            data: <GeoJSON.FeatureCollection<GeoJSON.Geometry>>{
                                type: "FeatureCollection",
                                features: [{
                                    type: "Feature",
                                    geometry: {
                                        type: "Point",
                                        coordinates: [place.longitude, place.latitude]
                                    }
                                }]
                            }
                        },
                        layout: {
                            "icon-image": imageName,
                            "icon-size": 0.15
                        }
                    });
                });
            });
        }
    }
}
