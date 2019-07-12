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
import { Injectable, InjectionToken } from "@angular/core";
import { HttpClient } from "../providers/http";
import { isDefined } from "../util/util.function";
var CONFIG_FILE = "./assets/config.json";
export var CONFIG_PROVIDER = new InjectionToken("Token for ConfigProvider");
/**
 * Provider for the config file. The file is loaded over angular {@link Http}.
 * This class assumes, that the config file is valid.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var ILIASConfigProvider = /** @class */ (function () {
    function ILIASConfigProvider(http) {
        this.http = http;
        this.config = this.loadFile();
    }
    ILIASConfigProvider.prototype.loadConfig = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, this.config];
        }); });
    };
    ILIASConfigProvider.prototype.loadInstallation = function (installationId) {
        return __awaiter(this, void 0, void 0, function () {
            var iliasConfig, installation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.config];
                    case 1:
                        iliasConfig = _a.sent();
                        installation = iliasConfig.installations
                            .find(function (it) { return it.id == installationId; });
                        if (isDefined(installation)) {
                            return [2 /*return*/, installation];
                        }
                        throw new ReferenceError("Installation with id '" + installationId + "' does not exists in file: " + CONFIG_FILE);
                }
            });
        });
    };
    ILIASConfigProvider.prototype.loadFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.get(CONFIG_FILE)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json(configSchema)];
                }
            });
        });
    };
    ILIASConfigProvider = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [HttpClient])
    ], ILIASConfigProvider);
    return ILIASConfigProvider;
}());
export { ILIASConfigProvider };
var configSchema = {
    "title": "config",
    "type": "object",
    "properties": {
        "installations": {
            "type": "array",
            "items:": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "number",
                        "min": 1
                    },
                    "title": { "type": "string" },
                    "url": { "type": "string" },
                    "clientId": { "type": "string" },
                    "apiKey": { "type": "string" },
                    "apiSecret": { "type": "string" },
                    "accessTokenTTL": { "type": "number" }
                },
                "required": ["id", "title", "url", "clientId", "apiKey", "apiSecret", "accessTokenTTL"]
            }
        }
    },
    "required": ["installations"]
};
//# sourceMappingURL=ilias-config.js.map