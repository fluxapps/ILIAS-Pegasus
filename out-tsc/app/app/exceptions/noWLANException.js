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
import { Exception } from "./Exception";
/**
 * This error is thrown by the sync when you lose WLAN connection and you specified in the options that you only want
 * to download with WLAN.
 */
var NoWLANException = /** @class */ (function (_super) {
    __extends(NoWLANException, _super);
    function NoWLANException(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, NoWLANException.prototype);
        return _this;
    }
    return NoWLANException;
}(Exception));
export { NoWLANException };
//# sourceMappingURL=noWLANException.js.map