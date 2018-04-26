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

/**
 * The TextDecoder interface represents a decoder for a specific method,
 * that is a specific character encoding, like utf-8, iso-8859-2, koi8, cp1261, gbk, etc.
 * A decoder takes a stream of bytes as input and emits a stream of code points.
 */
declare class TextDecoder {
  /**
   * Is a DOMString containing the name of the decoder, that is a string describing the method the TextDecoder will use.
   */
  readonly encoding: string;
  /**
   * Is a Boolean indicating whether the error mode is fatal.
   */
  readonly fatal: boolean;
  /**
   * Is a Boolean indicating whether the byte order marker is ignored.
   */
  readonly ignoreBOM: boolean;

  /**
   * Returns a newly constructed TextDecoder that will generate a code point stream with the decoding method specified in parameters.
   *
   * @param {string} encoding
   */
  constructor(encoding: string);

  /**
   * The TextDecoder.decode method returns a DOMString containing the text,
   * given in parameters, decoded with the specific method for that TextDecoder object.
   *
   * @returns {string}
   */
  decode(): string;
  decode(buffer: ArrayBuffer|ArrayBufferView): string;
  decode(buffer: ArrayBuffer|ArrayBufferView, options: TextDecodeOptions): string;
}

declare interface TextDecodeOptions {
  /**
   * A Boolean flag indicating that additional data will follow in subsequent calls to decode().
   * Set to true if processing the data in chunks, and false for the final chunk or if the data is not chunked.
   * It defaults to false.
   */
  stream: boolean;
}
