import {HttpClient as Http, HttpResponse as Response, HttpHeaders, HttpParams} from "@angular/common/http";
import {Validator, ValidatorResult} from "jsonschema";
import {Injectable} from "@angular/core";
import * as HttpStatus from "http-status-codes";
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
import {isDefined} from "ionic-angular/es2015/util/util";
import {timeout} from "rxjs/operators";

export const DEFAULT_TIMEOUT: number = 20000;

/**
 * Abstracts the Http service of angular in async methods.
 * In addition, a smarter response type is used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
@Injectable()
export class HttpClient {

  private readonly log: Logger = Logging.getLogger(HttpClient.name);

  constructor(private readonly http: Http) {
  }

  /**
   * Wraps the {@link Http#get} method uses a timeout and returns a promise instead of an observable.
   *
   * @param {string} url - the url to perform the request
   * @param {RequestOptions} options - options used for the request
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throws {UnfinishedHttpRequestError} if the request fails
   */
  async get(url: string, options?: RequestOptions): Promise<HttpResponse> {

    try {

      this.log.trace(() => `Http GET request to: ${url}`);
      const response: Response<ArrayBuffer> = await this.http.get(url, toAngularOptions(options))
        .pipe(timeout(DEFAULT_TIMEOUT))
        .toPromise();

      return new HttpResponse(response);

    } catch(error) {
      this.log.warn(() => `Http GET request failed: resource=${url}`);
      this.log.debug(() => `Http GET request error: ${JSON.stringify(error)}`);
      throw new UnfinishedHttpRequestError(`Could no finish request: url=${url}`);
    }
  }

  /**
   * Wraps the {@link Http#post} method uses a timeout and returns a promise instead of an observable.
   *
   * @param {string} url - the url to perform the request
   * @param {string} body - the request body to post
   * @param {RequestOptions} options - options used for the request
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throws {UnfinishedHttpRequestError} if the request fails
   */
  async post(url: string, body?: string, options?: RequestOptions): Promise<HttpResponse> {

    try {

      this.log.trace(() => `Http POST request to: ${url}`);
      const response: Response<ArrayBuffer> = await this.http.post(url, body, toAngularOptions(options))
        .pipe(timeout(DEFAULT_TIMEOUT))
        .toPromise();

      return new HttpResponse(response);

    } catch (error) {
      this.log.warn(() => `Http GET request failed: resource=${url}`);
      this.log.debug(() => `Http GET request error: ${error}`);
      throw new UnfinishedHttpRequestError(`Could no finish request: url=${url}`);
    }
  }
}

/**
 * Contains http request options.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface RequestOptions {
    readonly headers?: Array<[string, string]>;
    readonly urlParams?: Array<[string, string]>;
}

/**
 * Defines the angular http module request options as an interface instead of an object literal.
 * Furthermore, only the 'arraybuffer' response type is set, because its everything we need for this module.
 */
export interface AngularRequestOptions {
  readonly headers?: HttpHeaders | {[header: string]: string | Array<string>};
  readonly observe: "response";
  readonly params?: HttpParams | {[param: string]: string | Array<string>};
  readonly reportProgress?: boolean;
  readonly responseType: "arraybuffer";
  readonly withCredentials?: boolean;
}

/**
 * Convert the given {@code opt} to the angular http module request options type {@link AngularRequestOptions}.
 *
 * @param {RequestOptions} opt - the options to convert
 *
 * @returns {AngularRequestOptions} the converted options
 */
export function toAngularOptions(opt?: RequestOptions): AngularRequestOptions {

  let headers: HttpHeaders = new HttpHeaders();
  if (isDefined(opt) && isDefined(opt.headers))
    opt.headers.forEach(it => {
      headers = headers.set(it[0], it[1])
    });

  let params: HttpParams = new HttpParams();
  if (isDefined(opt) && isDefined(opt.urlParams))
    opt.urlParams.forEach(it => {
      params = params.set(it[0], it[1])
    });

  return <AngularRequestOptions>{
    headers: headers,
    params: params,
    responseType: "arraybuffer",
    observe: "response",
    withCredentials: false,
    reportProgress: false
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

  constructor(private readonly response: Response<ArrayBuffer>) {
    this.ok = response.ok;
    this.status = response.status;
    this.statusText = response.statusText;
  }

  /**
   * Parses the response into json with the given {@code schema}.
   *
   * @param {Object} schema - the json schema to validate the response
   *
   * @returns {Object} the valid json
   * @throws {JsonValidationError} if the body could not be parsed or does not match the schema
   */
  json<T>(schema: object): T {

    const json: {} = this.tryJson(this.response, (): Error => {
      this.log.warn(() => "Could not parse response body to json");
      this.log.debug(() => `Request Body: ${this.response.body}`);
      return new JsonValidationError("Could not parse response body to json");
    });

    const result: ValidatorResult = this.validator.validate(json, schema);

    if (result.valid) {
      return <T>json;
    }

    throw new JsonValidationError(result.errors[0].message);
  }

  /**
   * /**
   * Returns the body as a string, presuming its UTF-8 encoded.
   *
   * @returns {string} the resulting text
   */
  text(): string {
    return String.fromCharCode.apply(undefined, new Uint8Array(this.response.body));

  }

  /**
   * @returns {ArrayBuffer} the body as an array buffer
   */
  arrayBuffer(): ArrayBuffer {
    return this.response.body;
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
  handle<T>(success: (response: HttpResponse) => T): T {

    switch (true) {

      case this.ok:
        return success(this);

      case this.status === HttpStatus.UNAUTHORIZED:
        this.log.warn(() => `Response handling with status code ${this.status}`);
        this.log.debug(() => this.getErrorMessage());
        throw new AuthenticateError(this.getErrorMessage());

      case this.status === HttpStatus.NOT_FOUND:
        this.log.warn(() => `Response handling with status code ${this.status}`);
        this.log.debug(() => this.getErrorMessage());
        throw new NotFoundError(this.getErrorMessage());

      default:
        this.log.warn(() => `Response handling with status code ${this.status}`);
        this.log.debug(() => this.getErrorMessage());
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
  private tryJson(response: Response<ArrayBuffer>, errorSupplier: () => Error): object {
    try {
      return JSON.parse(this.text());
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
 * Indicates that an  http request could not be finished.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class UnfinishedHttpRequestError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, UnfinishedHttpRequestError.prototype);
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
