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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { isDefined } from "../../util/util.function";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { HttpClient } from "../http";
import { OAUTH2_DATA_SUPPLIER, TOKEN_RESPONSE_CONSUMER } from "./ilias.rest-api";
var MILLISEC_TO_SEC = 1000;
export var TOKEN_MANAGER = new InjectionToken("token for token manager");
export var ILIAS_REST = new InjectionToken("token for ILIAS rest");
/**
 * Manages credentials provided by the given {@link OAuth2DataSupplier}.
 *
 * The given {@link TokenResponseConsumer} is called on successful access token refresh.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
var ILIASTokenManager = /** @class */ (function () {
    function ILIASTokenManager(httpClient, dataSupplier, responseConsumer) {
        this.httpClient = httpClient;
        this.dataSupplier = dataSupplier;
        this.responseConsumer = responseConsumer;
        this.log = Logging.getLogger(ILIASTokenManager_1.name);
    }
    ILIASTokenManager_1 = ILIASTokenManager;
    /**
     * Ensures that the returned access token is valid.
     * If the access token is expired, it will be refreshed.
     *
     * @returns {Promise<string>} the resulting access token
     * @throws {TokenExpiredError} if no valid access token can be used and the token can not be refreshed
     */
    ILIASTokenManager.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var credentials_1, token, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.dataSupplier.getClientCredentials()];
                    case 1:
                        credentials_1 = _a.sent();
                        this.log.trace(function () { return "Validate access token"; });
                        return [4 /*yield*/, this.takeIf(credentials_1.token.accessToken, function () {
                                return Date.now() / MILLISEC_TO_SEC - credentials_1.token.lastAccessTokenUpdate < credentials_1.token.accessTokenTTL;
                            })];
                    case 2:
                        token = _a.sent();
                        return [2 /*return*/, this.orElseGet(token, function () { return _this.updateAccessToken(credentials_1); })];
                    case 3:
                        error_1 = _a.sent();
                        throw new TokenExpiredError("Could not get a valid access token");
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the given {@code object} if the given {@code condition} is true.
     *
     * @param {T} object - the object to check
     * @param {() => boolean} condition - the condition to use
     *
     * @returns {Promise<T | undefined>} the object if the condition is true, otherwise undefined
     */
    ILIASTokenManager.prototype.takeIf = function (object, condition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (condition()) {
                    return [2 /*return*/, object];
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    /**
     * Returns the given {@code object} or the given {@code supplier} if the object is undefined.
     *
     * @param {T | undefined} object - the object to get
     * @param {() => Promise<T>} supplier - the supplier to use
     *
     * @returns {Promise<T>} the resulting object
     */
    ILIASTokenManager.prototype.orElseGet = function (object, supplier) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!isDefined(object)) {
                    return [2 /*return*/, supplier()];
                }
                return [2 /*return*/, object];
            });
        });
    };
    /**
     * Refreshes the access token by the refresh token and returns it.
     * The given arguments are used to get all relevant data to update
     * the access token.
     *
     * This method calls the {@link TokenResponseConsumer} on successful update.
     *
     * @param {ClientCredentials} credentials - the credentials to use
     *
     * @returns {Promise<string>} the updated access token
     * @throws {HttpRequestError} if the response is not ok
     */
    ILIASTokenManager.prototype.updateAccessToken = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = [
                            ["api_key", credentials.clientId],
                            ["api_secret", credentials.clientSecret],
                            ["grant_type", "refresh_token"],
                            ["refresh_token", credentials.token.refreshToken]
                        ];
                        this.log.info(function () { return "Refresh access token by refresh token"; });
                        return [4 /*yield*/, this.httpClient.post(credentials.accessTokenURL, undefined, { headers: headers })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.handle(function (it) { return __awaiter(_this, void 0, void 0, function () {
                                var data;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            data = it.json(oAuthTokenSchema);
                                            return [4 /*yield*/, this.responseConsumer.accept(data)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, data.access_token];
                                    }
                                });
                            }); })];
                }
            });
        });
    };
    var ILIASTokenManager_1;
    ILIASTokenManager = ILIASTokenManager_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(1, Inject(OAUTH2_DATA_SUPPLIER)),
        __param(2, Inject(TOKEN_RESPONSE_CONSUMER)),
        __metadata("design:paramtypes", [HttpClient, Object, Object])
    ], ILIASTokenManager);
    return ILIASTokenManager;
}());
export { ILIASTokenManager };
/**
 * Implementation of {@link ILIASRest}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
var ILIASRestImpl = /** @class */ (function () {
    function ILIASRestImpl(tokenManager, dataSupplier, httpClient) {
        this.tokenManager = tokenManager;
        this.dataSupplier = dataSupplier;
        this.httpClient = httpClient;
    }
    /**
     * Performs a get request to the given {@code path}.
     *
     * The path MUST start with a '/' character.
     * The api version MUST be part of the path.
     *
     * @param {string} path the endpoint without host, specific path
     * @param {ILIASRequestOptions} options ILIAS specific request options
     *
     * @returns {Promise<HttpResponse>} the resulting response
     * @throws {TokenExpiredError} if the access token is expired and could not be refreshed
     */
    ILIASRestImpl.prototype.get = function (path, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, options, function (url, opt) { return _this.httpClient.get(url, opt); })];
            });
        });
    };
    /**
     * Performs a post request to the given {@code path} with the given {@code body}
     * as the http request body.
     *
     * The path MUST start with a '/' character.
     * The api version MUST be part of the path.
     *
     * @param {string} path - the endpoint without host and specific path
     * @param {object} body - the request body
     * @param {ILIASRequestOptions} options - ILIAS specific request options
     *
     * @returns {Promise<HttpResponse>} the resulting response
     * @throw {TokenExpiredError} if the access token is expired and could not be refreshed
     */
    ILIASRestImpl.prototype.post = function (path, body, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, options, function (url, opt) { return _this.httpClient.post(url, JSON.stringify(body), opt); })];
            });
        });
    };
    /**
     * Sets up a http request by creating the complete url and the requests options.
     *
     * @param {string} path - the path to create the url for
     * @param {ILIASRequestOptions} options - the requests options to use
     * @param {RequestExecutor} executor - function called with the complete url and the request options
     *
     * @returns {Promise<HttpResponse>} the return value of the given {@code executor}
     */
    ILIASRestImpl.prototype.request = function (path, options, executor) {
        return __awaiter(this, void 0, void 0, function () {
            var credentials, url, headers, _a, _b, requestOptions;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.dataSupplier.getClientCredentials()];
                    case 1:
                        credentials = _c.sent();
                        url = "" + credentials.apiURL + path;
                        _a = ["Authorization"];
                        _b = credentials.token.type + " ";
                        return [4 /*yield*/, this.tokenManager.getAccessToken()];
                    case 2:
                        headers = [
                            _a.concat([_b + (_c.sent())])
                        ];
                        if (isDefined(options.accept))
                            headers.push(["Accept", options.accept]);
                        if (isDefined(options.contentType))
                            headers.push(["Content-Type", options.contentType]);
                        requestOptions = {
                            headers: headers,
                            urlParams: options.urlParams
                        };
                        return [2 /*return*/, executor(url, requestOptions)];
                }
            });
        });
    };
    ILIASRestImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(TOKEN_MANAGER)),
        __param(1, Inject(OAUTH2_DATA_SUPPLIER)),
        __metadata("design:paramtypes", [Object, Object, HttpClient])
    ], ILIASRestImpl);
    return ILIASRestImpl;
}());
export { ILIASRestImpl };
var oAuthTokenSchema = {
    "title": "oauth2 token",
    "type": "object",
    "properties": {
        "access_token": { "type": "string" },
        "refresh_token": { "type": "string" },
        "expires_in": { "type": "integer" },
        "token_type": { "type": "string" }
    },
    "required": ["access_token", "refresh_token", "expires_in", "token_type"]
};
/**
 * Indicates an expired token.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var TokenExpiredError = /** @class */ (function (_super) {
    __extends(TokenExpiredError, _super);
    function TokenExpiredError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, TokenExpiredError.prototype);
        return _this;
    }
    return TokenExpiredError;
}(Error));
export { TokenExpiredError };
//# sourceMappingURL=ilias.rest.js.map