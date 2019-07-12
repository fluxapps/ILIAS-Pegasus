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
var ILIASObjectAction = /** @class */ (function () {
    function ILIASObjectAction() {
    }
    ILIASObjectAction.prototype.instanceId = function () {
        if (this.id === null) {
            this.id = ILIASObjectAction.idCounter;
            ILIASObjectAction.idCounter++;
        }
        return this.id;
    };
    ILIASObjectAction.idCounter = 9999999;
    return ILIASObjectAction;
}());
export { ILIASObjectAction };
var ILIASObjectActionResult = /** @class */ (function () {
    function ILIASObjectActionResult(message) {
        this.message = message;
    }
    return ILIASObjectActionResult;
}());
export { ILIASObjectActionResult };
/**
 * An instance of this class can be returned when an action resolves its promise.
 */
var ILIASObjectActionSuccess = /** @class */ (function (_super) {
    __extends(ILIASObjectActionSuccess, _super);
    function ILIASObjectActionSuccess() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ILIASObjectActionSuccess;
}(ILIASObjectActionResult));
export { ILIASObjectActionSuccess };
/**
 * An instance of this class can be returned when an action rejects its promise.
 */
var ILIASObjectActionError = /** @class */ (function (_super) {
    __extends(ILIASObjectActionError, _super);
    function ILIASObjectActionError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ILIASObjectActionError;
}(ILIASObjectActionResult));
export { ILIASObjectActionError };
var ILIASObjectActionNoMessage = /** @class */ (function (_super) {
    __extends(ILIASObjectActionNoMessage, _super);
    function ILIASObjectActionNoMessage() {
        return _super.call(this, "") || this;
    }
    return ILIASObjectActionNoMessage;
}(ILIASObjectActionResult));
export { ILIASObjectActionNoMessage };
//# sourceMappingURL=object-action.js.map