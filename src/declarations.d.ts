/*
 Declaration files are how the Typescript compiler knows about the type information(or shape) of an object.
 They're what make intellisense work and make Typescript know all about your code.

 A wildcard module is declared below to allow third party libraries to be used in an app even if they don't
 provide their own type declarations.

 To learn more about using third party libraries in an Ionic app, check out the docs here:
 http://ionicframework.com/docs/v2/resources/third-party-libs/

 For more info on type definition files, check out the Typescript docs here:
 https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html
 */
import {IWhenable, Promise} from "q";

// wildcard module
declare module "*";

// type definitions of q is missing the any function
declare module "q" {

  /**
   * Returns a promise that is fulfilled by the first given promise
   * to be fulfilled, or rejected if all of the given promises are rejected.
   *
   * @param {Array<Q.IWhenable<T>>} promises - array of promises to check
   *
   * @returns {Promise<T>} the value of the first fulfilled promise
   */
  export function any<T>(promises: Array<IWhenable<T>>): Promise<T>;
}
