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
import { Platform } from "@ionic/angular";
import { Injectable } from "@angular/core";
/** ionic-native */
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import { Logging } from "../../logging/logging.service";
/**
 * Utils class to check hardware features with {@link Diagnostic}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var DiagnosticUtil = /** @class */ (function () {
    function DiagnosticUtil(platform, diagnostic) {
        this.platform = platform;
        this.diagnostic = diagnostic;
        this.log = Logging.getLogger(DiagnosticUtil_1.name);
    }
    DiagnosticUtil_1 = DiagnosticUtil;
    /**
     * @returns {Promise<boolean>} false if the location authorization status is denied, otherwise false
     */
    DiagnosticUtil.prototype.isLocationEnabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.log.info(function () { return "Evaluate location authorization status"; });
                        return [4 /*yield*/, this.diagnostic.getLocationAuthorizationStatus()];
                    case 1:
                        status_1 = _a.sent();
                        this.log.info(function () { return "Location authorization status: " + status_1; });
                        return [2 /*return*/, status_1 !== this.diagnostic.permissionStatus.DENIED];
                    case 2:
                        error_1 = _a.sent();
                        this.log.warn(function () { return "Could not evaluate Location Authorization Status: " + error_1; });
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @returns {Promise<boolean>} true if wifi is enabled, otherwise false
     */
    DiagnosticUtil.prototype.isWifiEnabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var enabled_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.log.info(function () { return "Evaluate wifi status"; });
                        return [4 /*yield*/, this.diagnostic.isWifiAvailable()];
                    case 1:
                        enabled_1 = _a.sent();
                        this.log.info(function () { return (enabled_1) ? "Wifi is enabled" : "Wifi is disabled"; });
                        return [2 /*return*/, enabled_1];
                    case 2:
                        error_2 = _a.sent();
                        this.log.warn(function () { return "Could not evaluate wifi Status: " + error_2; });
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * ANDROID ONLY!!! If used on any non Android device, always true will be returned.
     *
     * @returns {Promise<boolean>} true if roaming service is enabled, otherwise false
     */
    DiagnosticUtil.prototype.isRoamingEnabled = function () {
        return __awaiter(this, void 0, void 0, function () {
            var enabled_2, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!this.platform.is("android")) return [3 /*break*/, 2];
                        this.log.info(function () { return "Evaluate roaming service status"; });
                        return [4 /*yield*/, this.diagnostic.isDataRoamingEnabled()];
                    case 1:
                        enabled_2 = _a.sent();
                        this.log.info(function () { return (enabled_2) ? "Roaming Service is enabled" : "Roaming service is disabled"; });
                        return [2 /*return*/, enabled_2];
                    case 2:
                        this.log.info(function () { return "Can not evaluate roaming service on a non Android device"; });
                        return [2 /*return*/, true];
                    case 3:
                        error_3 = _a.sent();
                        this.log.warn(function () { return "Could not evaluate roaming service status: " + error_3; });
                        return [2 /*return*/, true];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    var DiagnosticUtil_1;
    DiagnosticUtil = DiagnosticUtil_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [Platform,
            Diagnostic])
    ], DiagnosticUtil);
    return DiagnosticUtil;
}());
export { DiagnosticUtil };
//# sourceMappingURL=diagnostics.util.js.map