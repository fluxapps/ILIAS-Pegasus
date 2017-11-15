
import {
  CameraPosition, GoogleMap, ILatLng,
  MarkerOptions
} from "@ionic-native/google-maps";
import {BuildError} from "@ionic/app-scripts/dist/util/errors";
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
  private binding?: HTMLElement;

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
    throw new Error("This method is not implemented yet");
  }

  bind(node: string | HTMLElement): MapBuilder {
    throw new Error("This method is not implemented yet");
  }

  async build(): Promise<StandardMap> {

    if (isUndefined(this.cameraPosition)) {
      throw new MapEvaluationError("Can not build map: Requires camera position");
    }

    if (isUndefined(this.binding)) {
      throw new MapEvaluationError("Can not build map: Requires a node to bind the map");
    }

    throw new Error("This method is not implemented yet");
  }
}

export class MapEvaluationError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MapEvaluationError.prototype);
  }
}
