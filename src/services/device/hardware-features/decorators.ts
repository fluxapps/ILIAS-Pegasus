import {checkFeature, checkLocation, checkRoaming, checkWifi, HardwareFeature} from "./diagnostics.util";

export function RequireAll(...features: Array<HardwareFeature>): Function {

  return function(
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>>
  ): TypedPropertyDescriptor<(...args: Array<any>) => Promise<any>> {

    const method: Function = descriptor.value;

    descriptor.value = function (...args: Array<any>): Promise<any> {

      const featureStates: Array<Promise<any>> = [];

      features.forEach(feature => {
        featureStates.push(checkFeature(feature));
      });

      return Promise.all(featureStates)
        .then(function(): Promise<any> {return Promise.resolve(method.apply(this, args))}.bind(this))
        .catch(err => Promise.reject(err));

    }.bind(this);

    return descriptor;
  }
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
