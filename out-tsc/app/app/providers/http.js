var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/** angular */
import { Injectable } from "@angular/core";
import { HttpClient as Http, HttpHeaders, HttpParams, XhrFactory } from "@angular/common/http";
import { isDefined } from "../util/util.function";
/** rxjs */
import { Observable } from "rxjs";
import { catchError, retry, tap } from "rxjs/operators";
import { Logging } from "../services/logging/logging.service";
/** misc */
import { Validator } from "jsonschema";
import { IllegalStateError } from "../error/errors";
import * as HttpStatus from "http-status-codes";
/**
 * Abstracts the Http service of angular in async methods.
 * In addition, a smarter response type is used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
var HttpClient = /** @class */ (function () {
    function HttpClient(http) {
        this.http = http;
        this.log = Logging.getLogger(HttpClient_1.name);
    }
    HttpClient_1 = HttpClient;
    /**
     * Wraps the {@link Http#get} method uses a timeout and returns a promise instead of an observable.
     *
     * @param {string} url - the url to perform the request
     * @param {RequestOptions} options - options used for the request
     *
     * @returns {Promise<HttpResponse>} the resulting response
     * @throws {UnfinishedHttpRequestError} if the request fails
     */
    HttpClient.prototype.get = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.trace(function () { return "Http GET request to: " + url; });
                        return [4 /*yield*/, this.http.get(url, toAngularOptions(options)).pipe(tap(function (_) { return _this.log.trace(function () { return "Http GET request succeeded to: " + url; }); }, function (_) { return _this.log.warn(function () { return "Http GET request attempt failed to: " + url; }); }), retry(HttpClient_1.RETRY_COUNT), catchError(function (error) {
                                _this.log.error(function () { return "Http GET request failed: resource=" + url; });
                                _this.log.debug(function () { return "Http GET request error: " + JSON.stringify(error); });
                                return Observable.throw(new UnfinishedHttpRequestError("Could not finish request: url=" + url));
                            })).toPromise()];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, new HttpResponse(response)];
                }
            });
        });
    };
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
    HttpClient.prototype.post = function (url, body, options) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.trace(function () { return "Http POST request to: " + url; });
                        return [4 /*yield*/, this.http.post(url, body, toAngularOptions(options)).pipe(tap(function (_) { return _this.log.trace(function () { return "Http POST request succeeded to: " + url; }); }, function (_) { return _this.log.warn(function () { return "Http POST request attempt failed to: " + url; }); }), retry(HttpClient_1.RETRY_COUNT), catchError(function (error) {
                                _this.log.error(function () { return "Http POST request failed: resource=" + url; });
                                _this.log.debug(function () { return "Http POST request error: " + JSON.stringify(error); });
                                return Observable.throw(new UnfinishedHttpRequestError("Could not finish POST request: url=" + url));
                            })).toPromise()];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, new HttpResponse(response)];
                }
            });
        });
    };
    var HttpClient_1;
    HttpClient.RETRY_COUNT = 2;
    HttpClient = HttpClient_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [Http])
    ], HttpClient);
    return HttpClient;
}());
export { HttpClient };
/**
 * Convert the given {@code opt} to the angular http module request options type {@link AngularRequestOptions}.
 *
 * @param {RequestOptions} opt - the options to convert
 *
 * @returns {AngularRequestOptions} the converted options
 */
export function toAngularOptions(opt) {
    var headers = new HttpHeaders();
    if (isDefined(opt) && isDefined(opt.headers))
        opt.headers.forEach(function (it) {
            headers = headers.set(it[0], it[1]);
        });
    var params = new HttpParams();
    if (isDefined(opt) && isDefined(opt.urlParams))
        opt.urlParams.forEach(function (it) {
            params = params.set(it[0], it[1]);
        });
    return {
        headers: headers,
        params: params,
        responseType: "arraybuffer",
        observe: "response",
        withCredentials: false,
        reportProgress: false
    };
}
/**
 * Abstracts the Response type of angular in a smarter way.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var HttpResponse = /** @class */ (function () {
    function HttpResponse(response) {
        this.response = response;
        this.validator = new Validator();
        this.log = Logging.getLogger(HttpResponse.name);
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
    HttpResponse.prototype.json = function (schema) {
        var _this = this;
        var json = this.tryJson(this.response, function () {
            _this.log.warn(function () { return "Could not parse response body to json"; });
            _this.log.debug(function () { return "Request Body: " + _this.text(); });
            return new JsonValidationError("Could not parse response body to json");
        });
        var result = this.validator.validate(json, schema);
        if (result.valid) {
            return json;
        }
        this.log.debug(function () { return "Request Body: " + _this.text(); });
        throw new JsonValidationError("Response body does not match json schema");
    };
    /**
     * /**
     * Returns the body as a string, presuming its UTF-8 encoded.
     *
     * @returns {string} the resulting text
     */
    HttpResponse.prototype.text = function () {
        if (!("TextDecoder" in window)) {
            var message_1 = "This browser does not support TextDecoder.";
            this.log.fatal(function () { return message_1; });
            throw new IllegalStateError(message_1);
        }
        var decoder = new TextDecoder("utf-8");
        return decoder.decode(this.response.body);
    };
    /**
     * @returns {ArrayBuffer} the body as an array buffer
     */
    HttpResponse.prototype.arrayBuffer = function () {
        return this.response.body;
    };
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
    HttpResponse.prototype.handle = function (success) {
        var _this = this;
        switch (true) {
            case this.ok:
                return success(this);
            case this.status === HttpStatus.UNAUTHORIZED:
                this.log.warn(function () { return "Response handling with status code " + _this.status; });
                this.log.debug(function () { return _this.getErrorMessage(); });
                throw new AuthenticateError(this.getErrorMessage());
            case this.status === HttpStatus.NOT_FOUND:
                this.log.warn(function () { return "Response handling with status code " + _this.status; });
                this.log.debug(function () { return _this.getErrorMessage(); });
                throw new NotFoundError(this.getErrorMessage());
            default:
                this.log.warn(function () { return "Response handling with status code " + _this.status; });
                this.log.debug(function () { return _this.getErrorMessage(); });
                throw new HttpRequestError(this.status, this.getErrorMessage());
        }
    };
    HttpResponse.prototype.getErrorMessage = function () {
        return this.statusText + ": resource=" + this.response.url;
    };
    /**
     * Executes the {@link Response#json} method in a try catch.
     * If an error occurs the given {@code errorSupplier} is used to throw an {@link Error}.
     *
     * @param {Response} response response to call the json method
     * @param {() => Error} errorSupplier supplies the error that is thrown on catch
     *
     * @returns {object} the resulting json
     */
    HttpResponse.prototype.tryJson = function (response, errorSupplier) {
        try {
            return JSON.parse(this.text());
        }
        catch (error) {
            throw errorSupplier();
        }
    };
    return HttpResponse;
}());
export { HttpResponse };
/**
 * Indicates a that a json could not be parsed or does not match a required json schema.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
// TODO: For some unknown reason, this error can not be initialized
var JsonValidationError = /** @class */ (function (_super) {
    __extends(JsonValidationError, _super);
    function JsonValidationError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, JsonValidationError.prototype);
        return _this;
    }
    return JsonValidationError;
}(Error));
export { JsonValidationError };
/**
 * Indicates that an  http request could not be finished.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var UnfinishedHttpRequestError = /** @class */ (function (_super) {
    __extends(UnfinishedHttpRequestError, _super);
    function UnfinishedHttpRequestError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, UnfinishedHttpRequestError.prototype);
        return _this;
    }
    return UnfinishedHttpRequestError;
}(Error));
export { UnfinishedHttpRequestError };
/**
 * Indicates a http request error with a status code 4xx or 5xx.
 * - 4xx Client Errors
 * - 5xx Server Errors
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var HttpRequestError = /** @class */ (function (_super) {
    __extends(HttpRequestError, _super);
    function HttpRequestError(statuscode, message, responseBody) {
        var _this = _super.call(this, message) || this;
        _this.statuscode = statuscode;
        _this.responseBody = responseBody;
        Object.setPrototypeOf(_this, HttpRequestError.prototype);
        return _this;
    }
    return HttpRequestError;
}(Error));
export { HttpRequestError };
/**
 * Indicates an 401 Authentication Failure from a http request.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var AuthenticateError = /** @class */ (function (_super) {
    __extends(AuthenticateError, _super);
    function AuthenticateError(message, responseBody) {
        var _this = _super.call(this, HttpStatus.BAD_REQUEST, message, responseBody) || this;
        Object.setPrototypeOf(_this, AuthenticateError.prototype);
        return _this;
    }
    return AuthenticateError;
}(HttpRequestError));
export { AuthenticateError };
/**
 * Indicates a 404 Not Found failure from a http request.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message, responseBody) {
        var _this = _super.call(this, HttpStatus.NOT_FOUND, message, responseBody) || this;
        Object.setPrototypeOf(_this, NotFoundError.prototype);
        return _this;
    }
    return NotFoundError;
}(HttpRequestError));
export { NotFoundError };
var PegasusXhrFactory = /** @class */ (function (_super) {
    __extends(PegasusXhrFactory, _super);
    function PegasusXhrFactory() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.log = Logging.getLogger(PegasusXhrFactory.name);
        //used to identify the xhr requests
        _this.xhrCount = 0;
        return _this;
    }
    PegasusXhrFactory.prototype.build = function () {
        var xhr = new XMLHttpRequest();
        //prevent save integer overflow
        if (this.xhrCount === Number.MAX_SAFE_INTEGER)
            this.xhrCount = 0;
        var xhrId = ++this.xhrCount;
        this.log.trace(function () { return "XHR-" + xhrId + " created."; });
        this.registerLoadendEvent(xhr, xhrId);
        this.registerLoadstartEvent(xhr, xhrId);
        this.registerTimeoutEvent(xhr, xhrId);
        this.registerReadyStateChangeEventListener(xhr, xhrId);
        return xhr;
    };
    /**
     * fired after OPENED
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    PegasusXhrFactory.prototype.registerLoadstartEvent = function (xhr, xhrId) {
        var _this = this;
        xhr.addEventListener("loadstart", function (ev) {
            _this.log.trace(function () { return "XHR-" + xhrId + " set timeout to " + PegasusXhrFactory.TIMEOUT; });
            xhr.timeout = PegasusXhrFactory.TIMEOUT;
        }, {
            capture: false,
            once: true,
            passive: true
        });
    };
    /**
     * fired after DONE (this will be fired after the error handlers)
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    PegasusXhrFactory.prototype.registerLoadendEvent = function (xhr, xhrId) {
        var _this = this;
        xhr.addEventListener("loadend", function (ev) {
            _this.log.trace(function () { return "XHR-" + xhrId + " load end status event: \"" + ev.loaded + "/" + ev.total + "\""; });
        }, {
            capture: false,
            once: true,
            passive: true
        });
    };
    /**
     * fired after DONE in case of timeout
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    PegasusXhrFactory.prototype.registerTimeoutEvent = function (xhr, xhrId) {
        var _this = this;
        xhr.addEventListener("timeout", function (ev) {
            _this.log.warn(function () { return "XHR-" + xhrId + " timeout event received with progress: \"" + ev.loaded + "/" + ev.total + "\""; });
        }, {
            capture: false,
            once: true,
            passive: true
        });
    };
    /**
     * fires at state changes OPENED, HEADERS_RECEIVED, LOADING, DONE
     *
     * @param {XMLHttpRequest} xhr
     * @param {number} xhrId
     */
    PegasusXhrFactory.prototype.registerReadyStateChangeEventListener = function (xhr, xhrId) {
        var _this = this;
        var state = 0;
        var stateReadChangeListener = function (ev) {
            var newState = xhr.readyState;
            if (newState > state) {
                _this.log.trace(function () { return "XHR-" + xhrId + " ready state change from " + XhrState[state] + " to " + XhrState[newState]; });
                state = newState;
            }
            if (state === XMLHttpRequest.DONE) {
                xhr.removeEventListener("readystatechange", stateReadChangeListener);
                _this.log.trace(function () { return "XHR-" + xhrId + " unregister ready state event listener"; });
            }
        };
        xhr.addEventListener("readystatechange", stateReadChangeListener, {
            capture: false,
            once: false,
            passive: true
        });
    };
    /* timeout in milliseconds, 0 means no timeout at all
     * please only set this if the http backend is aware of the timeout event. (Angular 5.2.8 is not aware of the event)
     */
    PegasusXhrFactory.TIMEOUT = 0;
    return PegasusXhrFactory;
}(XhrFactory));
export { PegasusXhrFactory };
/**
 * All ready states of XMLHttpRequest,
 * the primary use of the enum is to print the
 * written state instead of a number.
 */
var XhrState;
(function (XhrState) {
    XhrState[XhrState["UNSENT"] = 0] = "UNSENT";
    XhrState[XhrState["OPENED"] = 1] = "OPENED";
    XhrState[XhrState["HEADERS_RECEIVED"] = 2] = "HEADERS_RECEIVED";
    XhrState[XhrState["LOADING"] = 3] = "LOADING";
    XhrState[XhrState["DONE"] = 4] = "DONE"; //  The operation is complete.
})(XhrState || (XhrState = {}));
//# sourceMappingURL=http.js.map