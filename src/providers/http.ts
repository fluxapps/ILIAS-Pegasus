import {Http, RequestOptionsArgs, Response} from "@angular/http";
import {Validator, ValidatorResult} from "jsonschema";
import {Injectable} from "@angular/core";
import * as HttpStatus from "http-status-codes";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";

export const DEFAULT_TIMEOUT: number = 20000;

/**
 * Abstracts the Http service of angular in async methods.
 * In addition, a smarter response type is used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class HttpClient {

  private readonly log: Logger = Logging.getLogger(HttpClient.name);

  constructor(private readonly http: Http) {
  }

  /**
   * Wraps the {@link Http#get} method uses a timeout and returns a promise instead of an observable.
   *
   * @param {string} url the url to perform the request
   * @param {RequestOptionsArgs} options options used for the request
   *
   * @returns {Promise<HttpResponse>} the resulting response
   */
  async get(url: string, options?: RequestOptionsArgs): Promise<HttpResponse> {

    this.log.info(() => `Http GET request to: ${url}`);
    const response: Response = await this.http.get(url, options)
      .timeout(DEFAULT_TIMEOUT)
      .toPromise();

    return new HttpResponse(response);
  }

  /**
   * Wraps the {@link Http#post} method uses a timeout and returns a promise instead of an observable.
   *
   * @param {string} url the url to perform the request
   * @param {string} body the request body to post
   * @param {RequestOptionsArgs} options options used for the request
   *
   * @returns {Promise<HttpResponse>} the resulting response
   */
  async post(url: string, body?: string, options?: RequestOptionsArgs): Promise<HttpResponse> {

    this.log.info(() => `Http POST request to: ${url}`);
    const response: Response = await this.http.post(url, body, options)
      .timeout(DEFAULT_TIMEOUT)
      .toPromise();

    return new HttpResponse(response);
  }
}

/**
 * Abstracts the Response type of angular in a smarter way.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class HttpResponse {

  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;

  private readonly validator: Validator = new Validator();

  private readonly log: Logger = Logging.getLogger(HttpResponse.name);

  constructor(private readonly response: Response) {
    this.ok = response.ok;
    this.status = response.status;
    this.statusText = response.statusText;
  }

  /**
   * Parses the response into json with the given {@code schema}.
   *
   * @param {Object} schema the json schema to validate the response
   *
   * @returns {Object} the valid json
   * @throws {JsonValidationError} if the body could not be parsed or does not match the schema
   */
  json<T>(schema: object): T {

    const json: {} = this.tryJson(this.response, (): Error =>
      new JsonValidationError("Could not parse response body to json")
    );

    const result: ValidatorResult = this.validator.validate(json, schema);

    if (result.valid) {
      return <T>json;
    }

    throw new JsonValidationError(result.errors[0].message);
  }

  /**
   * /**
   * Returns the body as a string, presuming `toString()` can be called on the response body.
   *
   * When decoding an `ArrayBuffer`, the optional `encodingHint` parameter determines how the
   * bytes in the buffer will be interpreted. Valid values are:
   *
   * - `legacy` - incorrectly interpret the bytes as UTF-16 (technically, UCS-2). Only characters
   *   in the Basic Multilingual Plane are supported, surrogate pairs are not handled correctly.
   *   In addition, the endianness of the 16-bit octet pairs in the `ArrayBuffer` is not taken
   *   into consideration. This is the default behavior to avoid breaking apps, but should be
   *   considered deprecated.
   *
   * - `iso-8859` - interpret the bytes as ISO-8859 (which can be used for ASCII encoded text).
   *
   * @param {"legacy" | "iso-8859"} encodingHint the encoding hint to use
   *
   * @returns {string} the resulting text
   */
  text(encodingHint?: "legacy" | "iso-8859"): string {
    return this.response.text(encodingHint)
  }

  /**
   * @returns {ArrayBuffer} the body as an array buffer
   */
  arrayBuffer(): ArrayBuffer {
    return this.response.arrayBuffer()
  }

  /**
   * @returns {Blob} the request's body as a Blob, assuming that body exists
   */
  blob(): Blob {
    return this.response.blob()
  }

  /**
   * Default response handling. Depending on the status code
   * an appropriate {@link HttpRequestError} will be thrown.
   *
   * If the response is ok, the given {@code success} callback
   * will be executed.
   *
   * @param {(response: HttpResponse) => T} success callback to execute on ok response
   *
   * @returns {T} the resulting value of the callback
   * @throws {AuthenticateError} if the status code is 401
   * @throws {NotFoundError} if the status code is 404
   * @throws {HttpRequestError} if no status code is not explicit handled and not ok
   */
  async handle<T>(success: (response: HttpResponse) => Promise<T>): Promise<T> {

    switch (true) {

      case this.ok:
        return success(this);

      case this.status === HttpStatus.UNAUTHORIZED:
        this.log.warn(() => `Response handling with status code ${this.status}`);
        this.log.trace(() => this.getErrorMessage());
        throw new AuthenticateError(this.getErrorMessage());

      case this.status === HttpStatus.NOT_FOUND:
        this.log.warn(() => `Response handling with status code ${this.status}`);
        this.log.trace(() => this.getErrorMessage());
        throw new NotFoundError(this.getErrorMessage());

      default:
        this.log.warn(() => `Response handling with status code ${this.status}`);
        this.log.trace(() => this.getErrorMessage());
        throw new HttpRequestError(this.status, this.getErrorMessage());
    }
  }

  private getErrorMessage(): string {
    return `${this.statusText}: resource=${this.response.url}`;
  }

  /**
   * Executes the {@link Response#json} method in a try catch.
   * If an error occurs the given {@code errorSupplier} is used to throw an {@link Error}.
   *
   * @param {Response} response response to call the json method
   * @param {() => Error} errorSupplier supplies the error that is thrown on catch
   *
   * @returns {object} the resulting json
   */
  private tryJson(response: Response, errorSupplier: () => Error): object {
    try {
      return response.json();
    } catch (error) {
      throw errorSupplier();
    }
  }
}

/**
 * Indicates a that a json could not be parsed or does not match a required json schema.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class JsonValidationError extends TypeError {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, JsonValidationError.prototype);
  }
}

/**
 * Indicates a http request error with a status code 4xx or 5xx.
 * - 4xx Client Errors
 * - 5xx Server Errors
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class HttpRequestError extends Error {

  constructor(readonly statuscode: number,
              message: string,
              readonly responseBody?: string) {
    super(message);
    Object.setPrototypeOf(this, HttpRequestError.prototype);
  }
}

/**
 * Indicates an 401 Authentication Failure from a http request.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class AuthenticateError extends HttpRequestError {

  constructor(message: string, responseBody?: string) {
    super(HttpStatus.BAD_REQUEST, message, responseBody);
    Object.setPrototypeOf(this, AuthenticateError.prototype);
  }
}

/**
 * Indicates a 404 Not Found failure from a http request.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class NotFoundError extends HttpRequestError {

  constructor(message: string, responseBody?: string) {
    super(HttpStatus.NOT_FOUND, message, responseBody);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
