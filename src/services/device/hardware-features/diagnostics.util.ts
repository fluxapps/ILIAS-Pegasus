import {HardwareAccessError, LocationAccessError, RoamingAccessError, WifiAccessError} from "./hardware-access.errors";
import {Reject, Resolve} from "../../../declarations";
import {Logger} from "../../logging/logging.api";
import {Logging} from "../../logging/logging.service";

/**
 * Enumerator for all supported hardware features
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export enum HardwareFeature {
  LOCATION,
  WIFI,
  ROAMING
}

/**
 * Invokes the appropriate check function of the given feature.
 *
 * If the given feature is not supported, the promise will be resolved with the error message.
 * The reason behind this decision can be reread in the file src/services/device/hardware-features/decorators.ts
 *
 * @param {HardwareFeature} feature - the hardware feature to check
 */
export function checkFeature(feature: HardwareFeature): Promise<string> {

  const log: Logger = Logging.getLogger("checkFeature");

  switch (feature) {
    case HardwareFeature.LOCATION:
      return checkLocation();
    case HardwareFeature.ROAMING:
      return checkRoaming();
    case HardwareFeature.WIFI:
      return checkWifi();
    default:
      log.warn(() => `Could not evaluate hardware feature: ${feature}`);
      return Promise.resolve(`Could not evaluate feature: ${feature}`);
  }
}

/**
 * Checks if the Location can be accessed by this app.
 *
 * If the condition can not be evaluated, the promise will be resolved with the error message.
 * The reason behind this decision can be reread in the file src/services/device/hardware-features/decorators.ts
 *
 * @returns {Promise<string>} a message about the location status
 */
export function checkLocation(): Promise<string> {

  const log: Logger = Logging.getLogger("checkLocation");

  return new Promise((resolve: Resolve<string>, reject: Reject<HardwareAccessError>): void => {

    log.info(() => "Evaluate location authorization status");

    window["cordova"].plugins.diagnostic.getLocationAuthorizationStatus((status: string): void => {

      log.info(() => `Found location authorization status: ${status}`);

      if (status == window["cordova"].plugins.diagnostic.permissionStatus.DENIED){
        reject(new LocationAccessError("Can not use location: Permission denied"));
      } else {
        resolve(`Location Authorization Status: Permission ${status}`);
      }
    }, (msg: string) => {
      log.warn(() => `Could not evaluate Location Authorization Status: ${msg}`);
      resolve(msg);
    });
  });
}

/**
 * Checks if the wifi can be accessed by this app.
 *
 * If the condition can not be evaluated, the promise will be resolved with the error message.
 * The reason behind this decision can be reread in the file src/services/device/hardware-features/decorators.ts
 *
 * @returns {Promise<string>} a message about the wifi status
 */
export function checkWifi(): Promise<string> {

  const log: Logger = Logging.getLogger("checkWifi");

  return new Promise((resolve: Resolve<string>, reject: Reject<HardwareAccessError>): void => {

    log.info(() => "Evaluate wifi availability");

    window["cordova"].plugins.diagnostic.isWifiAvailable((available: boolean) => {

      log.info(() => (available)? "Wifi is available" : "Wifi is not available");

      if (available) {
        resolve("Wifi is available");
      } else {
        reject(new WifiAccessError("Can not use wifi: Not available"));
      }

    }, (msg: string) => {
      log.warn(() => `Could not evaluate Wifi Availability: ${msg}`);
      resolve(msg);
    });
  });
}

/**
 * ANDROID ONLY!!!
 *
 * Checks if the roaming data service can be accessed by this app.
 *
 * If the condition can not be evaluated, the promise will be resolved with the error message.
 * The reason behind this decision can be reread in the file src/services/device/hardware-features/decorators.ts
 *
 * @returns {Promise<string>} a message about the roaming data service status
 */
export function checkRoaming(): Promise<string> {

  const log: Logger = Logging.getLogger("checkRoaming");

  return new Promise((resolve: Resolve<string>, reject: Reject<HardwareAccessError>): void => {

    log.info(() => "Evaluate roaming service");

    window["cordova"].plugins.diagnostic.isDataRoamingEnabled((enabled: boolean) => {

      log.info(() => (enabled)? "Roaming service is enabled" : "Roaming service is disabled");

      if (enabled) {
        resolve("Data roaming is available");
      } else {
        reject(new RoamingAccessError("Can not use roaming: Not enabled"));
      }

    }, (msg: string) => {
      log.warn(() => `Could not evaluate roaming data service: ${msg}`);
      resolve(msg);
    });
  });
}
