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
/** providers */
import { USER_REPOSITORY } from "../../providers/repository/repository.user";
import { ILIASRestProvider } from "../../providers/ilias-rest.provider";
/** errors and exceptions */
import { NoSuchElementError } from "../../error/errors";
/** misc */
import { CONFIG_PROVIDER } from "../../config/ilias-config";
import { User } from "../../models/user";
export var INSTALLATION_LINK_PROVIDER = new InjectionToken("token for installation link supplier");
export var TOKEN_SUPPLIER = new InjectionToken("token for authentication token supplier");
/**
 * Default implementation of an installation link supplier.
 * The installation url is fetch, by the currently authenticated user installation id.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
var InstallationLinkSupplierImpl = /** @class */ (function () {
    function InstallationLinkSupplierImpl(configProvider, userRepository) {
        this.configProvider = configProvider;
        this.userRepository = userRepository;
    }
    /**
     *
     * @returns {Promise<string>} The installation id.
     *
     * @throws ReferenceError     Thrown if the installation was not found.
     * @throws NoSuchElementError Thrown if no user is authenticated.
     */
    InstallationLinkSupplierImpl.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, installation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findAuthenticatedUser()];
                    case 1:
                        user = _a.sent();
                        if (!user.isPresent()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.configProvider.loadInstallation(user.get().installationId)];
                    case 2:
                        installation = _a.sent();
                        return [2 /*return*/, installation.url];
                    case 3: throw new NoSuchElementError("No authenticated user found.");
                }
            });
        });
    };
    InstallationLinkSupplierImpl = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(0, Inject(CONFIG_PROVIDER)),
        __param(1, Inject(USER_REPOSITORY)),
        __metadata("design:paramtypes", [Object, Object])
    ], InstallationLinkSupplierImpl);
    return InstallationLinkSupplierImpl;
}());
export { InstallationLinkSupplierImpl };
/**
 * Supplies short living ILIAS SOO auth tokens.
 * Which are used for a onetime authentication of a user.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
var AuthTokenSupplier = /** @class */ (function () {
    function AuthTokenSupplier(restProvider) {
        this.restProvider = restProvider;
    }
    /**
     * Supplies a short living ILIAS SSO token.
     *
     * @returns {Promise<string>} The auth token which can be used to authenticate the user.
     *
     * @throws RESTAPIException   Thrown if the auth token request failed.
     */
    AuthTokenSupplier.prototype.get = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = this.restProvider).getAuthToken;
                        return [4 /*yield*/, User.currentUser()];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    AuthTokenSupplier = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [ILIASRestProvider])
    ], AuthTokenSupplier);
    return AuthTokenSupplier;
}());
export { AuthTokenSupplier };
//# sourceMappingURL=link-builder.supplier.js.map