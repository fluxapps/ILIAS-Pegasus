
import {
  CameraPosition, GoogleMap, GoogleMapOptions, GoogleMapsEvent, ILatLng,
  MarkerOptions
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

  // TODO: Expose methods from GoogleMap until this method: https://ionicframework.com/docs/native/google-maps/#setPadding
}

class StandardMapBinding implements StandardMap {

    constructor(
      private readonly map: GoogleMap
    ) {}
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
