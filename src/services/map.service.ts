import {
  CameraPosition, GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, ILatLng, LatLng, MapType,
  MarkerOptions, MyLocation, MyLocationOptions, VisibleRegion
} from "@ionic-native/google-maps";
import {isUndefined} from "util";

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
 * Describes a standard map that is used in the map service.
 * It exposes allowed method from a google map and hides methods
 * that should not be used directly and only be accessed via
 * the {@link MapBuilder}.
 *
 * @see https://ionicframework.com/docs/native/google-maps
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface StandardMap {

  setDiv(domNode: string | HTMLElement): void

  getDiv(): HTMLElement

  setMapTypeId(mapTypeId: MapType): void

  animateCamera(position: CameraPosition<ILatLng>): Promise<void>

  animateCameraZoomIn(): Promise<void>

  animateCameraZoomOut(): Promise<void>

  moveCamera(position: CameraPosition<ILatLng>): Promise<void>

  moveCameraZoomIn(): Promise<void>

  moveCameraZoomOut(): Promise<void>

  getCameraPosition(): CameraPosition<ILatLng>

  getCameraTarget(): Promise<ILatLng>

  getCameraZoom(): number

  getCameraBearing(): number

  getCameraTilt(): number

  setCameraTarget(target: ILatLng): void

  setCameraZoom(zoomLevel: number): void

  setCameraTilt(tiltLevel: number): void

  setCameraBearing(bearing: number): void

  panBy(x: number, y: number): void

  getVisibleRegion(): VisibleRegion

  getMyLocation(options?: MyLocationOptions): Promise<MyLocation>

  setClickable(isClickable: boolean): void

  remove(): Promise<void>

  clear(): Promise<void>

  fromLatLngToPoint(latLng: ILatLng): Promise<object>

  fromPointToLatLng(point: object): Promise<LatLng>

  setMyLocationEnabled(enabled: boolean): void

  getFocusedBuilding(): Promise<object>

  setIndoorEnabled(enabled: boolean): void

  setTrafficEnabled(enabled: boolean): void

  setCompassEnabled(enabled: boolean): void

  setAllGesturesEnabled(enabled: boolean): void

  setVisible(visible: boolean): void

  setPadding(top: number, right: number, left: number, bottom: number): void
}

/**
 * {@link StandardMapBinding} is a abstraction from the {@link GoogleMap}.
 * Its used as a wrapper class, because some methods of the google map
 * should only be accessed via the {@link MapBuilder}.
 *
 * Methods are delegated to the given {@code map} instance.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
class StandardMapBinding implements StandardMap {

  constructor(
    private readonly map: GoogleMap
  ) {}

  setDiv(domNode: string | HTMLElement): void { this.map.setDiv(domNode) }

  getDiv(): HTMLElement { return this.map.getDiv() }

  setMapTypeId(mapTypeId: MapType): void { this.map.setMapTypeId(mapTypeId) }

  async animateCamera(position: CameraPosition<ILatLng>): Promise<void> {
    return this.map.animateCamera(position)
  }

  animateCameraZoomIn(): Promise<void> { return this.map.animateCameraZoomIn() }

  animateCameraZoomOut(): Promise<void> { return this.map.animateCameraZoomOut() }

  moveCamera(position: CameraPosition<ILatLng>): Promise<void> {
    return this.map.moveCamera(position);
  }

  moveCameraZoomIn(): Promise<void> { return this.map.moveCameraZoomIn() }

  moveCameraZoomOut(): Promise<void> { return this.map.moveCameraZoomOut() }

  getCameraPosition(): CameraPosition<ILatLng> { return this.map.getCameraPosition() }

  async getCameraTarget(): Promise<ILatLng> { return this.map.getCameraTarget() }

  getCameraZoom(): number { return this.map.getCameraZoom() }

  getCameraBearing(): number { return this.map.getCameraBearing() }

  getCameraTilt(): number { return this.map.getCameraTilt() }

  setCameraTarget(target: ILatLng): void { this.map.setCameraTarget(target) }

  setCameraZoom(zoomLevel: number): void { this.map.setCameraZoom(zoomLevel) }

  setCameraTilt(tiltLevel: number): void { this.map.setCameraTilt(tiltLevel) }

  setCameraBearing(bearing: number): void { this.map.setCameraBearing(bearing) }

  panBy(x: number, y: number): void { this.map.panBy(x, y) }

  getVisibleRegion(): VisibleRegion { return this.map.getVisibleRegion() }

  async getMyLocation(options?: MyLocationOptions): Promise<MyLocation> {
    return this.map.getMyLocation(options);
  }

  setClickable(isClickable: boolean): void { this.map.setClickable(isClickable) }

  async remove(): Promise<void> { return this.map.remove() }

  async clear(): Promise<void> { return this.map.clear() }

  async fromLatLngToPoint(latLng: ILatLng): Promise<object> {
    return this.map.fromLatLngToPoint(latLng);
  }

  async fromPointToLatLng(point: object): Promise<LatLng> {
    return this.map.fromPointToLatLng(point);
  }

  setMyLocationEnabled(enabled: boolean): void { this.map.setMyLocationEnabled(enabled) }

  getFocusedBuilding(): Promise<object> { return this.map.getFocusedBuilding() }

  setIndoorEnabled(enabled: boolean): void { this.map.setIndoorEnabled(enabled) }

  setTrafficEnabled(enabled: boolean): void { this.map.setTrafficEnabled(enabled) }

  setCompassEnabled(enabled: boolean): void { this.map.setCompassEnabled(enabled) }

  setAllGesturesEnabled(enabled: boolean): void { this.map.setAllGesturesEnabled(enabled) }

  setVisible(visible: boolean): void { this.map.setVisible(visible) }

  setPadding(top: number, right: number, bottom: number, left: number): void {
      this.map.setPadding(top, right, bottom, left);
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
 * @version 1.0.0
 */
export class MapBuilder {

  private cameraPosition?: CameraPosition<ILatLng>;
  private markerOptions?: MarkerOptions;
  private binding?: string | HTMLElement;

  private readonly defaultControls: object = {
    compass: false,
    myLocationButton: true,
    indoorPicker: false,
    zoom: true
  };

  private readonly defaultGestures: object = {
    rotate: true,
    scroll: true,
    tilt: false,
    zoom: true
  };

  /**
   * Uses the given {@code position} as the map camera.
   *
   * @param {GeoCoordinate} position the position to set the camera
   *
   * @returns {MapBuilder} this instance
   */
  camera(position: GeoCoordinate): MapBuilder {

    this.cameraPosition = <CameraPosition<ILatLng>>{
      zoom: 10,
      tilt: 0,
      target: <ILatLng>{
        lat: position.latitude,
        lng: position.longitude
      }
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

    this.markerOptions = <MarkerOptions>{
      title: marker.title,
      icon: "blue",
      animation: "DROP",
      position: <ILatLng>{
        lat: marker.position.latitude,
        lng: marker.position.longitude
      },
      snippet: marker.snippet
    };

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
   * @see GoogleMap#one, GoogleMapsEvent#MAP_READY
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

    console.log(JSON.stringify(this.binding));
    const googleMap: GoogleMap = new GoogleMap(this.binding, <GoogleMapOptions>{
      camera: this.cameraPosition,
      controls: this.defaultControls,
      gestures: this.defaultGestures
    });

    await googleMap.one(GoogleMapsEvent.MAP_READY);

    this.applyIfNotUndefined(this.markerOptions, async(options: MarkerOptions) => {
      await googleMap.addMarker(options);
    });

    return Promise.resolve(new StandardMapBinding(googleMap));
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
