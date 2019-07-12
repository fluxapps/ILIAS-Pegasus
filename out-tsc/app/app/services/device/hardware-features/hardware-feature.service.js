var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/** angular */
import { Injectable } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { DiagnosticUtil } from "./diagnostics.util";
import { LocationRequirement, RoamingRequirement, WifiRequirement } from "./hardware-requirements";
/**
 * Provides various hardware feature requirements in order to check, if these features
 * are available to the app.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.2
 */
var Hardware = /** @class */ (function () {
    function Hardware(modalCtrl, diagnosticUtil) {
        this.modalCtrl = modalCtrl;
        this.diagnosticUtil = diagnosticUtil;
    }
    /**
     * All given {@link HardwareFeature} must be enabled in order to surpass the check.
     *
     * @param {HardwareFeature} first - at least one feature is required
     * @param {HardwareFeature} more - any additional feature to check
     *
     * @returns {HardwareRequirement} the created hardware requirement
     */
    Hardware.prototype.requireAll = function (first) {
        var more = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            more[_i - 1] = arguments[_i];
        }
        throw new Error("This method is not implemented yet");
    };
    /**
     * At least one of the given {@link HardwareFeature} must be enabled in order to surpass the check.
     *
     * @param {HardwareFeature} first - at least one feature is required
     * @param {HardwareFeature} more - any additional feature to check
     *
     * @returns {HardwareRequirement} the created hardware requirement
     */
    Hardware.prototype.requireAny = function (first) {
        var more = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            more[_i - 1] = arguments[_i];
        }
        throw new Error("This method is not implemented yet");
    };
    /**
     * The location must be enabled in order to surpass the check.
     *
     * @returns {HardwareRequirement} the created hardware requirement
     */
    Hardware.prototype.requireLocation = function () {
        return new LocationRequirement(this.modalCtrl, this.diagnosticUtil);
    };
    /**
     * The wifi must be enabled in order to surpass the check.
     *
     * @returns {HardwareRequirement} the created hardware requirement
     */
    Hardware.prototype.requireWifi = function () {
        return new WifiRequirement(this.modalCtrl, this.diagnosticUtil);
    };
    /**
     * ANDROID ONLY!!! If this feature is used on any non Android device, the check will not be done.
     *
     * The roaming service must be enabled in order to surpass the check.
     *
     * @returns {HardwareRequirement} the created hardware requirement
     */
    Hardware.prototype.requireRoaming = function () {
        return new RoamingRequirement(this.modalCtrl, this.diagnosticUtil);
    };
    Hardware = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [ModalController,
            DiagnosticUtil])
    ], Hardware);
    return Hardware;
}());
export { Hardware };
/**
 * Enumerator for all supported hardware features
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export var HardwareFeature;
(function (HardwareFeature) {
    HardwareFeature[HardwareFeature["LOCATION"] = 0] = "LOCATION";
    HardwareFeature[HardwareFeature["WIFI"] = 1] = "WIFI";
    HardwareFeature[HardwareFeature["ROAMING"] = 2] = "ROAMING";
})(HardwareFeature || (HardwareFeature = {}));
//# sourceMappingURL=hardware-feature.service.js.map