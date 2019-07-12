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
var CantOpenFileTypeException = /** @class */ (function (_super) {
    __extends(CantOpenFileTypeException, _super);
    function CantOpenFileTypeException(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, CantOpenFileTypeException.prototype);
        return _this;
    }
    return CantOpenFileTypeException;
}(Exception));
export { CantOpenFileTypeException };
//# sourceMappingURL=CantOpenFileTypeException.js.map