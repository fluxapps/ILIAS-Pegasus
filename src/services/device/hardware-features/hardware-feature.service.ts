import {HardwareAccessError} from "./hardware-access.errors";
import {Injectable} from "@angular/core";

/**
 * Provides various hardware feature requirements in order to check, if these features
 * are available to the app.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class Hardware {

  /**
   * All given {@link HardwareFeature} must be enabled in order to surpass the check.
   *
   * @param {HardwareFeature} first - at least one feature is required
   * @param {HardwareFeature} more - any additional feature to check
   *
   * @returns {HardwareRequirement} the created hardware requirement
   */
  requireAll(first: HardwareFeature, ...more: Array<HardwareFeature>): HardwareRequirement {
    throw new Error("This method is not implemented yet");
  }

  /**
   * At least one of the given {@link HardwareFeature} must be enabled in order to surpass the check.
   *
   * @param {HardwareFeature} first - at least one feature is required
   * @param {HardwareFeature} more - any additional feature to check
   *
   * @returns {HardwareRequirement} the created hardware requirement
   */
  requireAny(first: HardwareFeature, ...more: Array<HardwareFeature>): HardwareRequirement {
    throw new Error("This method is not implemented yet");
  }

  /**
   * The location must be enabled in order to surpass the check.
   *
   * @returns {HardwareRequirement} the created hardware requirement
   */
  requireLocation(): HardwareRequirement {
    throw new Error("This method is not implemented yet");
  }

  /**
   * The wifi must be enabled in order to surpass the check.
   *
   * @returns {HardwareRequirement} the created hardware requirement
   */
  requireWifi(): HardwareRequirement {
    throw new Error("This method is not implemented yet");
  }

  /**
   * ANDROID ONLY!!! If this feature is used on any non Android device, the check will not be done.
   *
   * The roaming service must be enabled in order to surpass the check.
   *
   * @returns {HardwareRequirement} the created hardware requirement
   */
  requireRoaming(): HardwareRequirement {
    throw new Error("This method is not implemented yet");
  }
}

/**
 * Describes a hardware feature and checks its availability to the app.
 *
 * In order to avoid side effects, a hardware feature will be treated as enabled
 * if the feature could not be evaluated.
 *
 * If a feature is not available to the app, a {@code HardwareRequirement} will throw an {@link HardwareAccessError}
 * in order to break the current function.
 *
 * Due this functionality, a {@code HardwareRequirement} MUST NOT be used in a try/catch block
 * and should only be used in Angular Components.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface HardwareRequirement {

  /**
   * Executes the given {@code action} when the requirement is not fulfilled.
   *
   * @param {() => void} action - function to execute
   *
   * @returns {HardwareRequirement} this instance
   */
  onFailure(action: () => void): HardwareRequirement

  /**
   * Evaluates the hardware feature and throws an {@link HardwareAccessError} if the feature is not enabled.
   *
   * @throws {HardwareAccessError} if the feature is not enabled
   */
  check(): Promise<void>
}

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
