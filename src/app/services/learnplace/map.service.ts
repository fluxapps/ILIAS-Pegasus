import {MapPlaceModel} from "./block.model";
import {Inject, Injectable, InjectionToken, ɵConsole} from "@angular/core";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/learnplace/repository/learnplace.repository";
import {LearnplaceEntity} from "../../entity/learnplace/learnplace.entity";
import {Observable,  from } from "rxjs";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import { switchMap } from "rxjs/operators";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import mapboxgl from "mapbox-gl"
import {environment} from "../../../environments/environment";
import {isDefined, isNullOrUndefined} from "../../util/util.function";
import { LEARNPLACE_LOADER, RestLearnplaceLoader } from "./loader/learnplace";
import { Console } from "console";

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

/**
 * Describes a service to operate with Maps.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
export interface MapService {
    /**
     * Creates a observable map by the given {@code learnplaceObjectId}.
     *
     * @param {number} learnplaceObjectId - ILIAS object id of the learnplace
     *
     * @returns {Observable<MapPlaceModel>} an observable of the map
     */
    getMapPlace(learnplaceObjectId: number): Observable<MapPlaceModel>

    /**
     * Creates observables of maps by the given {@code learnplaceObjectIds}.
     *
     * @param {Array<number>} lpObjIds - ILIAS object id of the learnplace
     *
     * @returns {Array<Observable<MapPlaceModel>>} an observable of the map
     */
    getMapPlaces(lpObjIds: Array<number>): Array<Observable<MapPlaceModel>>

    places(ilObjIds: Array<MapPlaceModel>): MapService

    /**
     * Uses the given {@code position} as the map camera.
     *
     * @param {CameraOptions} options the position to set the camera
     *
     * @returns {MapService} this instance
     */
    camera(options: CameraOptions): MapService

    /**
     * Uses the given {@code marker} on the map.
     * Only one marker can be used. A second call
     * on this method will override the previous marker.
     *
     * @param {Marker} marker the marker to add to the map
     *
     * @returns {MapService} this instance
     */
    marker(marker: Marker): MapService

    /**
     * Binds the built map to the given {@code node}.
     *
     * @param {string | HTMLElement} node the node to bind the map on
     *
     * @returns {MapService} this instance
     */
    bind(node: string | HTMLElement): MapService

    /**
     * Builds the map depending on the used options.
     *
     * This methods awaits the ready event of the created map.
     *
     * @returns {Promise<StandardMap>}
     * @throws {MapEvaluationError} if the builder is not used properly
     */
    build(): Promise<StandardMap>

    /**
     * Adds additional Markers to the map.
     *
     * @param {string} id - A unique id
     * @param {MapPlaceModel} place - The place containing the coordinates
     *
     * @returns {void} void
     */
    addPlace(id: string, place: MapPlaceModel): void

    /**
     * Shutdown every depending or async task which can be occurred by the {@link MapService#getMap} method.
     */
    shutdown(): void;
}
export const MAP_SERVICE: InjectionToken<MapService> = new InjectionToken("token for map service");

/**
 * Manages the visibility of a map by using the {@link VisibilityStrategy}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.2.0
 */
@Injectable()
export class VisibilityManagedMapService implements MapService {
    private cameraPosition?: CameraOptions;
    private markerOptions?: Marker;
    private placeOptions?: Array<MapPlaceModel>
    private binding?: string | HTMLElement;
    private readonly DEFAULT_ZOOM: number = 13;
    private mapboxMap: mapboxgl.Map;

    constructor(
        private readonly visibilityStrategyApplier: VisibilityStrategyApplier,
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    ) {
        if (typeof mapboxgl.accessToken !== "string" || mapboxgl.accessToken.length === 0) {
            mapboxgl.accessToken = environment.mapboxApiKey;
        }
    }

    camera(options: CameraOptions): MapService {

        this.cameraPosition = {
            zoom: options.zoom || this.DEFAULT_ZOOM,
            position: options.position
        };

        return this;
    }

    marker(marker: Marker): MapService {

        this.markerOptions = marker;

        return this;
    }

    places(ilObjIds: Array<MapPlaceModel>) {
        this.placeOptions = ilObjIds;

        return this;
    }

    bind(node: string | HTMLElement): MapService {

        this.binding = node;

        return this;
    }

    async build(): Promise<StandardMap> {
        this.throwIfUndefined(this.cameraPosition, () => {
            return new MapEvaluationError("Can not build map: Requires camera position");
        });

        this.throwIfUndefined(this.binding, () => {
            return new MapEvaluationError("Can not build map: Requires a node to bind the map")
        });

        this.mapboxMap = new mapboxgl.Map({
            container: this.binding,
            center: [this.cameraPosition.position.longitude, this.cameraPosition.position.latitude],
            style: "mapbox://styles/mapbox/streets-v9",
            zoom: this.cameraPosition.zoom,
            interactive: true
        });

        // Add geolocate control to the map.
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

        this.applyIfNotUndefined(this.markerOptions, (marker) => {
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

                this.applyIfNotUndefined(this.placeOptions, places => {
                    if (places.length > 1) {
                        places.filter((place: MapPlaceModel) =>
                                place.visible &&
                                !(place.latitude === marker.position.latitude && place.longitude === marker.position.longitude)
                            )
                            .forEach((place: MapPlaceModel, i: number) => {
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
                })
            });
        });

        return Promise.resolve(new MapboxMapBinding(this.mapboxMap));
    }

    addPlace(id: string, place: MapPlaceModel): void {
        console.error(`adding place ${id} at ${place.latitude}, ${place.longitude}`);
        this.mapboxMap.addSource(id, {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": [id],
                        "geometry": {
                            "type": "Point",
                            "coordinates": [place.latitude, place.longitude]
                        }
                    },
                ]
            }
        });

        Promise.resolve(new MapboxMapBinding(this.mapboxMap));
    }

    /**
     * Creates a observable map by the given {@code learnplaceObjectId}.
     *
     * The returned maps visibility is managed by the {@link VisibilityStrategy}.
     *
     * @param {number} lpObjId - ILIAS object id of the learnplace
     *
     * @returns {Observable<MapPlaceModel>} an observable of the map
     */
    getMapPlace(lpObjId: number): Observable<MapPlaceModel> {

        return new Observable((observer) => {
            // tslint:disable-next-line: no-floating-promises
            this.learnplaceRepository.findByObjectIdAndUserId(lpObjId, AuthenticationProvider.getUser().id).then(it => {
                const learnplace: LearnplaceEntity = it.get();

                const place: MapPlaceModel = new MapPlaceModel(
                    lpObjId,
                    learnplace.location.latitude,
                    learnplace.location.longitude,
                    learnplace.map.zoom,
                    VisibilityStrategyType[learnplace.map.visibility.value]
                );

                this.visibilityStrategyApplier.setLearnplace(learnplace.id);
                this.visibilityStrategyApplier.apply(place, VisibilityStrategyType[learnplace.map.visibility.value])
                    .subscribe(place => {
                        observer.next(place)
                        observer.complete();
                    });
            });
        });

        // return from(this.userRepository.findAuthenticatedUser())
        //     .pipe(
        //         switchMap(it => {
        //             return from(this.learnplaceRepository.findByObjectIdAndUserId(lpObjId, it.get().id))
        //         }),
        //         switchMap(it => {
        //             console.log("Map learnplace:", it.get());
        //             const learnplace: LearnplaceEntity = it.get();

        //             const place: MapPlaceModel = new MapPlaceModel(
        //                 lpObjId,
        //                 learnplace.location.latitude,
        //                 learnplace.location.longitude,
        //                 learnplace.map.zoom,
        //                 VisibilityStrategyType[learnplace.map.visibility.value]
        //             );

        //             console.error("a");
        //             this.visibilityStrategyApplier.setLearnplace(learnplace.id);
        //             return this.visibilityStrategyApplier.apply(place, VisibilityStrategyType[learnplace.map.visibility.value]);
        //         })
        //     );
    }

    getMapPlaces(lpObjIds: Array<number>): Array<Observable<MapPlaceModel>> {
        if (!lpObjIds) {
            return;
        }

        return lpObjIds.map(id => this.getMapPlace(id));
    }

    /**
     * Invokes {@link VisibilityStrategyApplier#shutdown} method.
     */
    shutdown(): void {
        this.visibilityStrategyApplier.shutdown();
    }

    /**
     * Throws the given {@code error} if the given {@code object} is undefined.
     *
     * @param {T} object the object to check
     * @param {() => Error} error the error to throw
     *
     * @throws Error if the given {@code object} is undefined
     */
    private throwIfUndefined<T>(object: T | undefined, error: () => Error): void {
        if (isNullOrUndefined(object)) {
            throw error();
        }
    }

    /**
     * Executes the given {@code block} if the given {@code object} is not undefined.
     *
     * @param {T} object the object to check
     * @param {(object: T) => void} apply the function to execute with the given {@code object} as parameter
     */
    private applyIfNotUndefined<T>(object: T | undefined, apply: (object: T) => void): void {
        if (isDefined(object)) {
            apply(object);
        }
    }
}
