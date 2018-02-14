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

// wildcard module
declare module "*";

/*
 * For easier type def in a Promise constructor.
 *
 * e.g. new Promise((resolve: Resolve<string>, reject: Reject<Error>) => {...);
 *
 * The {@code Reject} type requires an Error type to be more consistent in the javascript error handling
 */
declare type Resolve<T> = (value?: T) => void
declare type Reject<T extends Error> = (reason: T) => void

declare type Consumer<T> = (item: T) => void
