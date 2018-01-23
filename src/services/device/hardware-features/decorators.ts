/*

Contains decorators to evaluate hardware features.

These decorators will break the control flow of the program, if its condition is not fulfilled by throwing a HardwareAccessError.
In order to avoid side effects, a decorator does just invoke the decorated function, if an error occurs while evaluating the condition.

Or in oder words
A DECORATOR WILL BREAK THE CONTROL FLOW OF THE PROGRAM, IF AND ONLY IF THE CONDITION IS EXPLICITLY NOT FULFILLED.

Due the way how an thrown error works in javascript it is only safe to use these decorators inside an Angular Component.
More info about these decorators: @see https://confluence.studer-raimann.ch/display/P32ILAPP/Device+Hardware+Features
 */

import {checkFeature, checkLocation, checkRoaming, checkWifi, HardwareFeature} from "./diagnostics.util";
import * as Q from "q";
import {Reject, Resolve} from "../../../declarations";
import {HardwareAccessError} from "./hardware-access.errors";
import {Logging} from "../../logging/logging.service";
import {Logger} from "../../logging/logging.api";

declare type HardwareFeatureFunction = (...args: Array<any>) => Promise<any>;

/**
 * At least one of the given hardware features must be available in order to invoke the decorated function.
 *
 * @param {HardwareFeature} first - at least one feature is required
 * @param {HardwareFeature} more - any additional feature to check
 *
 * @returns {Function} this decorator
 * @throws {HardwareAccessError} if one or more of the given features is not available
 */
export function RequireAny(first: HardwareFeature, ...more: Array<HardwareFeature>): Function {

  const log: Logger = Logging.getLogger("@RequireAny");

  return function(
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<HardwareFeatureFunction>
  ): TypedPropertyDescriptor<HardwareFeatureFunction> {

    const method: Function = descriptor.value;
    const features: Array<HardwareFeature> = [first];
    more.forEach(it => features.push(it));

    descriptor.value = function(...args: Array<any>): Promise<any> {

      log.trace(() => `Evaluate any of the required hardware features: ${features.join(",")}`);

      const featureStates: Array<Promise<string>> = [];

      features.forEach(it => {
        featureStates.push(checkFeature(it));
      });

      return new Promise(function(resolve: Resolve<any>, reject: Reject<Error>): void {

        Q.any(featureStates)
          .then(function(msg: string): void {
            log.info(() => `First required hardware feature found: ${msg}`);
            resolve(method.apply(this, args));
          }.bind(this), reject)
      }.bind(this));
    }.bind(this);

    return descriptor;
  }
}

/**
 * All given hardware features must be available in order to invoke the decorated function.
 *
 * @param {HardwareFeature} first - at least one feature is required
 * @param {HardwareFeature} more - any additional feature to check
 *
 * @returns {Function} this decorator
 * @throws {HardwareAccessError} if no of the given features is available
 */
export function RequireAll(first: HardwareFeature, ...more: Array<HardwareFeature>): Function {

  const log: Logger = Logging.getLogger("@RequireAll");

  return function(
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<HardwareFeatureFunction>
  ): TypedPropertyDescriptor<HardwareFeatureFunction> {

    const method: Function = descriptor.value;
    const features: Array<HardwareFeature> = [first];
    more.forEach(it => features.push(it));

    descriptor.value = function(...args: Array<any>): Promise<any> {

      log.trace(() => `Evaluate all of the required hardware features: ${features.join(",")}`);

      const featureStates: Array<Promise<string>> = [];

      features.forEach(it => {
        featureStates.push(checkFeature(it));
      });

      return Promise.all(featureStates)
        .then(function(): Promise<any> {
          log.info(() => `Found all required hardware features: ${features.join(",")}`);
          return Promise.resolve(method.apply(this, args))
        }.bind(this))
        .catch(err => Promise.reject(err));

    }.bind(this);

    return descriptor;
  };
}

/**
 * The location must be enabled in order to invoke the decorated function.
 */
export function RequireLocation(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<HardwareFeatureFunction>
): TypedPropertyDescriptor<HardwareFeatureFunction> {

  const method: Function = descriptor.value;

  descriptor.value = function(...args: Array<any>): Promise<any> {

    return checkLocation()
      .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}

/**
 * The Wifi must be available in order to invoke the decorated function.
 */
export function RequireWifi(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<HardwareFeatureFunction>
): TypedPropertyDescriptor<HardwareFeatureFunction> {

  const method: Function = descriptor.value;

  descriptor.value = function(...args: Array<any>): Promise<any> {

    return checkWifi()
      .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}

/**
 * ANDROID ONLY!!!
 *
 * The roaming data service must be enabled in order to invoke the decorated function.
 */
export function RequireRoaming(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<HardwareFeatureFunction>
): TypedPropertyDescriptor<HardwareFeatureFunction> {

  const method: Function = descriptor.value;

  descriptor.value = function(...args: Array<any>): Promise<any> {

    return checkRoaming()
      .then(function() {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}
