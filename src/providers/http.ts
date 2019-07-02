/** angular */
import {Injectable} from "@angular/core";
import {HttpClient as Http, HttpHeaders, HttpParams, HttpResponse as Response, XhrFactory} from "@angular/common/http";
import {isDefined} from "ionic-angular/es2015/util/util";
/** logging */
import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
/** misc */
import {Validator, ValidatorResult} from "jsonschema";
import {Observable} from "rxjs/Observable";
import {IllegalStateError} from "../error/errors";
import * as HttpStatus from "http-status-codes";

/**
 * Abstracts the Http service of angular in async methods.
 * In addition, a smarter response type is used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
@Injectable({
    providedIn: "root"
})
export class HttpClient {

  private static readonly RETRY_COUNT: number = 2;

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

    this.log.trace(() => `Http GET request to: ${url}`);
    const response: Response<ArrayBuffer> = await this.http.get(url, toAngularOptions(options))
      .do(
        (_) => this.log.trace(() => `Http GET request succeeded to: ${url}`),
        (_) => this.log.warn(() => `Http GET request attempt failed to: ${url}`)
      )
      .retry(HttpClient.RETRY_COUNT)
      .catch((error) => {
        this.log.error(() => `Http GET request failed: resource=${url}`);
        this.log.debug(() => `Http GET request error: ${JSON.stringify(error)}`);
        return Observable.throw(new UnfinishedHttpRequestError(`Could not finish request: url=${url}`));
      })
      .toPromise();

    return new HttpResponse(response);
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

    this.log.trace(() => `Http POST request to: ${url}`);
    const response: Response<ArrayBuffer> = await this.http.post(url, body, toAngularOptions(options))
      .do(
        (_) => this.log.trace(() => `Http POST request succeeded to: ${url}`),
        (_) => this.log.warn(() => `Http POST request attempt failed to: ${url}`)
      )
      .retry(HttpClient.RETRY_COUNT)
      .catch((error) => {
        this.log.error(() => `Http POST request failed: resource=${url}`);
        this.log.debug(() => `Http POST request error: ${JSON.stringify(error)}`);
        return Observable.throw(new UnfinishedHttpRequestError(`Could not finish POST request: url=${url}`));
      })
      .toPromise();

      return new HttpResponse(response);
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
      this.log.debug(() => `Request Body: ${this.text()}`);
      return new JsonValidationError("Could not parse response body to json");
    });

    const result: ValidatorResult = this.validator.validate(json, schema);

    if (result.valid) {
      return <T>json;
    }

    this.log.debug(() => `Request Body: ${this.text()}`);
    throw new JsonValidationError("Response body does not match json schema");
  }

  /**
   * /**
   * Returns the body as a string, presuming its UTF-8 encoded.
   *
   * @returns {string} the resulting text
   */
  text(): string {
    if (!("TextDecoder" in window)) {
      const message: string = "This browser does not support TextDecoder.";
      this.log.fatal(() => message);
      throw new IllegalStateError(message);
    }

    const decoder: TextDecoder = new TextDecoder("utf-8");
    return decoder.decode(this.response.body);

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
// TODO: For some unknown reason, this error can not be initialized
export class JsonValidationError extends Error {

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

export class PegasusXhrFactory extends XhrFactory {

    /* timeout in milliseconds, 0 means no timeout at all
     * please only set this if the http backend is aware of the timeout event. (Angular 5.2.8 is not aware of the event)
     */
    private static readonly TIMEOUT: number = 0;

    private readonly log: Logger = Logging.getLogger(PegasusXhrFactory.name);

    //used to identify the xhr requests
    private xhrCount: number = 0;

    build(): XMLHttpRequest {
        const xhr: XMLHttpRequest = new XMLHttpRequest();

        //prevent save integer overflow
        if(this.xhrCount === Number.MAX_SAFE_INTEGER)
            this.xhrCount = 0;

        const xhrId: number = ++this.xhrCount;
        this.log.trace(() => `XHR-${xhrId} created.`);

        this.registerLoadendEvent(xhr, xhrId);
        this.registerLoadstartEvent(xhr, xhrId);
        this.registerTimeoutEvent(xhr, xhrId);
        this.registerReadyStateChangeEventListener(xhr, xhrId);

        return xhr;
    }

    /**
     * fired after OPENED
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    private registerLoadstartEvent(xhr: XMLHttpRequest, xhrId: number): void {
        xhr.addEventListener("loadstart", (ev: Event): void => {
            this.log.trace(() => `XHR-${xhrId} set timeout to ${PegasusXhrFactory.TIMEOUT}`);
            xhr.timeout = PegasusXhrFactory.TIMEOUT;
        }, <AddEventListenerOptions>{
            capture: false,
            once: true,
            passive: true
        });
    }

    /**
     * fired after DONE (this will be fired after the error handlers)
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    private registerLoadendEvent(xhr: XMLHttpRequest, xhrId: number): void {
        xhr.addEventListener("loadend", (ev: ProgressEvent) => {
            this.log.trace(() => `XHR-${xhrId} load end status event: "${ev.loaded}/${ev.total}"`);
        }, <AddEventListenerOptions>{
            capture: false,
            once: true,
            passive: true
        });
    }

    /**
     * fired after DONE in case of timeout
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    private registerTimeoutEvent(xhr: XMLHttpRequest, xhrId: number): void {
        xhr.addEventListener("timeout", (ev: ProgressEvent) => {
            this.log.warn(() => `XHR-${xhrId} timeout event received with progress: "${ev.loaded}/${ev.total}"`);
        }, <AddEventListenerOptions>{
            capture: false,
            once: true,
            passive: true
        });
    }

    /**
     * fires at state changes OPENED, HEADERS_RECEIVED, LOADING, DONE
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    private registerReadyStateChangeEventListener(xhr: XMLHttpRequest, xhrId: number): void {
        let state: number = 0;
        const stateReadChangeListener: EventListener = (ev: Event): void => {
            const newState: number = xhr.readyState;
            if(newState > state) {
                this.log.trace(() => `XHR-${xhrId} ready state change from ${XhrState[state]} to ${XhrState[newState]}`);
                state = newState;
            }

            if (state === XMLHttpRequest.DONE) {
                xhr.removeEventListener("readystatechange", stateReadChangeListener);
                this.log.trace(() => `XHR-${xhrId} unregister ready state event listener`);
            }

        };

        xhr.addEventListener("readystatechange", stateReadChangeListener, <AddEventListenerOptions>{
            capture: false,
            once: false,
            passive: true
        });
    }
}

/**
 * All ready states of XMLHttpRequest,
 * the primary use of the enum is to print the
 * written state instead of a number.
 */
enum XhrState {
    UNSENT,             //	Client has been created. open() not called yet.
    OPENED,             //	open() has been called.
	HEADERS_RECEIVED,	//  send() has been called, and headers and status are available.
	LOADING,            //  Downloading; responseText holds partial data.
 	DONE	            //  The operation is complete.
}
