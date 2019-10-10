import {createStubInstance} from "sinon";
import {isFunction} from "ionic-angular/es2015/util/util";

/**
 * Creates a new object with the given {@code constructor} as the prototype by the
 * {@link createStubInstance} method. This method replaces every stub on the
 * created instance with either (): void => undefined for methods or undefined for properties.
 *
 * This enables the returned instance to create complete new stub methods.
 *
 * @param {Object} constructor the object to stub
 * @returns {T} the created instance
 */
export const stubInstance: <T>(constructor: object) => T = <T>(constructor): T => {

  const instance: T = createStubInstance(constructor);

  Object.getOwnPropertyNames(instance).forEach(prop => {
    instance[prop] = (isFunction(instance[prop]))? (): void => undefined : undefined;
  });

  return instance;
};

