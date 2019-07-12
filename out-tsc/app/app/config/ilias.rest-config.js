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
import { Inject, Injectable } from "@angular/core";
import { User } from "../models/user";
import { CONFIG_PROVIDER } from "./ilias-config";
var apiURL = "/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php";
/**
 * Provides the credentials data to ILIAS rest.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var Oauth2DataSupplierImpl = /** @class */ (function () {
    function Oauth2DataSupplierImpl(configProvider) {
        this.configProvider = configProvider;
    }
    /**
     * Loads the current user and gets the installation of him.
     *
     * Last Token update is converted from milliseconds to seconds.
     *
     * @returns {Promise<ClientCredentials>} the client credentials that should be used
     */
    Oauth2DataSupplierImpl.prototype.getClientCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, installation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.findActiveUser()];
                    case 1:
                        currentUser = _a.sent();
                        return [4 /*yield*/, this.configProvider.loadInstallation(currentUser.installationId)];
                    case 2:
                        installation = _a.sent();
                        return [2 /*return*/, {
                                clientId: installation.apiKey,
                                clientSecret: installation.apiSecret,
                                apiURL: "" + installation.url + apiURL,
                                accessTokenURL: "" + installation.url + apiURL + "/v2/oauth2/token",
                                token: {
                                    type: "Bearer",
                                    accessToken: currentUser.accessToken,
                                    refreshToken: currentUser.refreshToken,
                                    lastAccessTokenUpdate: currentUser.lastTokenUpdate / 1000,
                                    accessTokenTTL: installation.accessTokenTTL
                                }
                            }];
                }
            });
        });
    };
    Oauth2DataSupplierImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(CONFIG_PROVIDER)),
        __metadata("design:paramtypes", [Object])
    ], Oauth2DataSupplierImpl);
    return Oauth2DataSupplierImpl;
}());
export { Oauth2DataSupplierImpl };
/**
 * Consumes the token response from ILIAS rest.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var TokenResponseConsumerImpl = /** @class */ (function () {
    function TokenResponseConsumerImpl() {
    }
    /**
     * Store the given token data to the current user.
     *
     * @param {OAuth2Token} token   - the response of an access token url
     */
    TokenResponseConsumerImpl.prototype.accept = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.findActiveUser()];
                    case 1:
                        currentUser = _a.sent();
                        currentUser.lastTokenUpdate = Date.now();
                        currentUser.accessToken = token.access_token;
                        currentUser.refreshToken = token.refresh_token;
                        return [4 /*yield*/, currentUser.save()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TokenResponseConsumerImpl = __decorate([
        Injectable({
            providedIn: "root"
        })
    ], TokenResponseConsumerImpl);
    return TokenResponseConsumerImpl;
}());
export { TokenResponseConsumerImpl };
//# sourceMappingURL=ilias.rest-config.js.map