import {checkFeature, checkLocation, checkRoaming, checkWifi, HardwareFeature} from "./diagnostics.util";
import * as Q from "q";

export function RequireAll(first: HardwareFeature, ...more: Array<HardwareFeature>): Function {

  return function(
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>
  ): TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>> {

    const method: Function = descriptor.value;
    const features: Array<HardwareFeature> = [first];
    more.forEach(it => features.push(it));

    descriptor.value = function(...args: Array<any>): Promise<any> {

      const featureStates: Array<Promise<any>> = [];

      features.forEach(it => {
        featureStates.push(checkFeature(it));
      });

      return new Promise(function(resolve: (value: any) => void, reject: (reason?: any) => void): void {

        Q.any(featureStates)
          .then(function(): void {
            resolve(method.apply(this, args));
          }.bind(this), reject)
      }.bind(this));
    }.bind(this);

    return descriptor;
  }
}

export function RequireAny(first: HardwareFeature, ...more: Array<HardwareFeature>): Function {

  return function(
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>)
    : TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>> {

    const method: Function = descriptor.value;
    const features: Array<HardwareFeature> = [first];
    more.forEach(it => features.push(it));

    descriptor.value = function(...args: Array<any>): Promise<any> {

      const featureStates: Array<Promise<any>> = [];

      features.forEach(it => {
        featureStates.push(checkFeature(it));
      });

      return Promise.all(featureStates)
        .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
        .catch(err => Promise.reject(err));

    }.bind(this);

    return descriptor;
  };
}

export function RequireLocation(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>
): TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>> {

  const method: Function = descriptor.value;

  descriptor.value = function(...args: Array<any>): Promise<any> {

    return checkLocation()
      .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}

export function RequireWifi(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>
): TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>> {

  const method: Function = descriptor.value;

  descriptor.value = function(...args: Array<any>): Promise<any> {

    return checkWifi()
      .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}

export function RequireRoaming(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>
): TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>> {

  const method: Function = descriptor.value;

  descriptor.value = function(...args: Array<any>): Promise<any> {

    return checkRoaming()
      .then(function() {return Promise.resolve(method.apply(this, args))}.bind(this))
      .catch(err => Promise.reject(err));

  }.bind(this);

  return descriptor;
}
