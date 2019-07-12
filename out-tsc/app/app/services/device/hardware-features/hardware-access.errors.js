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
/**
 * Indicates that a hardware feature must not be used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var HardwareAccessError = /** @class */ (function (_super) {
    __extends(HardwareAccessError, _super);
    function HardwareAccessError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, HardwareAccessError.prototype);
        return _this;
    }
    return HardwareAccessError;
}(Error));
export { HardwareAccessError };
/**
 * Indicates that the location must not be used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var LocationAccessError = /** @class */ (function (_super) {
    __extends(LocationAccessError, _super);
    function LocationAccessError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, LocationAccessError.prototype);
        return _this;
    }
    return LocationAccessError;
}(HardwareAccessError));
export { LocationAccessError };
/**
 * Indicates that the wifi must not be used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var WifiAccessError = /** @class */ (function (_super) {
    __extends(WifiAccessError, _super);
    function WifiAccessError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, WifiAccessError.prototype);
        return _this;
    }
    return WifiAccessError;
}(HardwareAccessError));
export { WifiAccessError };
/**
 * Indicates that the roaming must not be used.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var RoamingAccessError = /** @class */ (function (_super) {
    __extends(RoamingAccessError, _super);
    function RoamingAccessError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, RoamingAccessError.prototype);
        return _this;
    }
    return RoamingAccessError;
}(HardwareAccessError));
export { RoamingAccessError };
//# sourceMappingURL=hardware-access.errors.js.map