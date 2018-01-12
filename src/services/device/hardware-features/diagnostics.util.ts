import {HardwareAccessError, LocationAccessError, RoamingAccessError, WifiAccessError} from "./hardware-access.errors";

export enum HardwareFeature {
  LOCATION,
  WIFI,
  ROAMING
}

export function checkFeature(feature: HardwareFeature): Promise<void> {

  switch (feature) {
    case HardwareFeature.LOCATION:
      return checkLocation();
    case HardwareFeature.ROAMING:
      return checkRoaming();
    case HardwareFeature.WIFI:
      return checkWifi();
    default:
      return Promise.reject(new HardwareAccessError(`Feature could not be evaluated: ${feature}`));
  }
}

export function checkLocation(): Promise<void> {

  return new Promise((resolve: () => void, reject: (reason: Error) => void): void => {

    window["cordova"].plugins.diagnostic.getLocationAuthorizationStatus((status: string): void => {

      if (status == window["cordova"].plugins.diagnostic.permissionStatus.DENIED){
        reject(new LocationAccessError("Can not use location: Permission denied"));
      } else {
        resolve();
      }
    }, (msg: string) => {
      reject(new LocationAccessError(msg));
    });
  });
}

export function checkWifi(): Promise<void> {

  return new Promise((resolve: () => void, reject: (reason: Error) => void): void => {

    window["cordova"].plugins.diagnostics.isWifiAvailable((available: boolean) => {

      if (available) {
        resolve();
      } else {
        reject(new WifiAccessError("Can not use wifi: Not available"));
      }

    }, (msg: string) => {
      reject(new WifiAccessError(msg));
    });
  });
}

export function checkRoaming(): Promise<void> {

  return new Promise((resolve: () => void, reject: (reason: Error) => void): void => {

    window["cordova"].plugins.diagnostics.isDataRoamingEnabled((enabled: boolean) => {

      if (enabled) {
        resolve();
      } else {
        reject(new RoamingAccessError("Can not use roaming: Not enabled"));
      }

    }, (msg: string) => {
      reject(new RoamingAccessError(msg));
    });
  });
}
