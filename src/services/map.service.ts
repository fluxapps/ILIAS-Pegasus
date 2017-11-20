
import {
  CameraPosition, GoogleMap, GoogleMapOptions, GoogleMapsEvent, ILatLng, LatLng, MapType,
  MarkerOptions, MyLocation, MyLocationOptions, VisibleRegion
} from "@ionic-native/google-maps";
import {isUndefined} from "util";

export interface GeoCoordinate {
  readonly longitude: number,
  readonly latitude: number
}

export interface Marker {
  readonly title: string,
  readonly snippet: string,
  readonly position: GeoCoordinate
}

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

export class MapBuilder {

  private cameraPosition?: CameraPosition<ILatLng>;
  private markerOptions?: MarkerOptions;
  private binding?: string | HTMLElement;

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

  bind(node: string | HTMLElement): MapBuilder {

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

    const map: GoogleMap = new GoogleMap(this.binding, <GoogleMapOptions>{camera: this.cameraPosition});

    await map.one(GoogleMapsEvent.MAP_READY);

    this.applyIfNotUndefined(this.markerOptions, async(options: MarkerOptions) => {
      await map.addMarker(options);
    });

    return Promise.resolve(map);
  }

  private throwIfUndefined<T>(object: T | undefined, error: () => Error): void {
    if (isUndefined(object)) {
      throw error();
    }
  }

  private applyIfNotUndefined<T>(object: T | undefined, block: (object: T) => void): void {
    if (!isUndefined(object)) {
      block(object);
    }
  }
}

export class MapEvaluationError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MapEvaluationError.prototype);
  }
}
