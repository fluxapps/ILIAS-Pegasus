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
 * Indicates that there is no element available.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var NoSuchElementError = /** @class */ (function (_super) {
    __extends(NoSuchElementError, _super);
    function NoSuchElementError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, NoSuchElementError.prototype);
        return _this;
    }
    return NoSuchElementError;
}(Error));
export { NoSuchElementError };
/**
 * Indicates an argument that is not valid.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
var IllegalArgumentError = /** @class */ (function (_super) {
    __extends(IllegalArgumentError, _super);
    function IllegalArgumentError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, IllegalArgumentError.prototype);
        return _this;
    }
    return IllegalArgumentError;
}(Error));
export { IllegalArgumentError };
/*
 * Describes an illegal state of a class.
 *
 * For example a builder requires data like the ILIAS ref id to
 * actually build the instance but the consumer of the builder just calls build
 * and omits the ref id setter call this error would be thrown to indicate that
 * the builder is not ready to build the link. Therefore, the builder is in an illegal state
 * for the build operation.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
var IllegalStateError = /** @class */ (function (_super) {
    __extends(IllegalStateError, _super);
    function IllegalStateError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, IllegalStateError.prototype);
        return _this;
    }
    return IllegalStateError;
}(Error));
export { IllegalStateError };
/**
 * Indicates an error with the input or output of the app.
 * For example filesystem operations, or on a low level also network.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
var IOError = /** @class */ (function (_super) {
    __extends(IOError, _super);
    function IOError(message) {
        var _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, IOError.prototype);
        return _this;
    }
    return IOError;
}(Error));
export { IOError };
//# sourceMappingURL=errors.js.map