import mapboxgl from "mapbox-gl"
import {isUndefined} from "util";
import {environment} from "../../environments/environment";

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
 * the {@link MapBuilder}.
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
 * should only be accessed via the {@link MapBuilder}.
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
 * Builder class to create a {@link StandardMap}.
 *
 * The builder requires some options to build the map:
 * - camera - {@link MapBuilder#camera}
 * - node to bind - {@link MapBuilder#bind}
 *
 * In order to use the {@link MapBuilder#bind} properly, this builder
 * MUST be used in a class, that has access to the given node.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */

export class MapBuilder {

  private cameraPosition?: CameraOptions;
  private markerOptions?: Marker;
  private binding?: string | HTMLElement;
  private readonly DEFAULT_ZOOM: number = 13;

    constructor() {
        if (typeof mapboxgl.accessToken !== "string" || mapboxgl.accessToken.length === 0) {
            mapboxgl.accessToken = environment.mapboxApiKey;
        }
    }

  /**
   * Uses the given {@code position} as the map camera.
   *
   * @param {CameraOptions} options the position to set the camera
   *
   * @returns {MapBuilder} this instance
   */
  camera(options: CameraOptions): MapBuilder {

    this.cameraPosition = {
        zoom: options.zoom || this.DEFAULT_ZOOM,
        position: options.position
    };

    return this;
  }

  /**
   * Uses the given {@code marker} on the map.
   * Only one marker can be used. A second call
   * on this method will override the previous marker.
   *
   * @param {Marker} marker the marker to add to the map
   *
   * @returns {MapBuilder} this instance
   */
  marker(marker: Marker): MapBuilder {

    this.markerOptions = marker;

    return this;
  }

  /**
   * Binds the built map to the given {@code node}.
   *
   * @param {string | HTMLElement} node the node to bind the map on
   *
   * @returns {MapBuilder} this instance
   */
  bind(node: string | HTMLElement): MapBuilder {

    this.binding = node;

    return this;
  }

  /**
   * Builds the map depending on the used options.
   *
   * This methods awaits the ready event of the created map.
   *
   * @returns {Promise<StandardMap>}
   * @throws {MapEvaluationError} if the builder is not used properly
   */
  async build(): Promise<StandardMap> {

    this.throwIfUndefined(this.cameraPosition, () => {
      return new MapEvaluationError("Can not build map: Requires camera position");
    });

    this.throwIfUndefined(this.binding, () => {
      return new MapEvaluationError("Can not build map: Requires a node to bind the map")
    });

    const mapboxMap: mapboxgl.Map = new mapboxgl.Map({
        container: this.binding,
        center: [this.cameraPosition.position.longitude, this.cameraPosition.position.latitude],
        style: "mapbox://styles/mapbox/streets-v9",
        zoom: this.cameraPosition.zoom,
        interactive: true
    });

      // Add geolocate control to the map.
      mapboxMap.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
              enableHighAccuracy: true
          },
          trackUserLocation: true
      }));
      // Add geolocate control to the map.
      mapboxMap.addControl(new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true
      }));

      this.applyIfNotUndefined(this.markerOptions, (marker) => {
          mapboxMap.once("load", () => {
              mapboxMap.loadImage(
                  "assets/icon/map_marker.png",
                  (error, image) => {
                  if (error) throw error;
                  const imageName: string = "learnplace";
                  mapboxMap.addImage(imageName, image);
                  mapboxMap.addLayer({
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
      });

    return Promise.resolve(new MapboxMapBinding(mapboxMap));
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
    if (isUndefined(object)) {
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
    if (!isUndefined(object)) {
      apply(object);
    }
  }
}

/**
 * Specific error, if the {@link MapBuilder} is not used properly.
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
