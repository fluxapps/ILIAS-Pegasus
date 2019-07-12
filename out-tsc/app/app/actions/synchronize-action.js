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
import { ILIASObjectAction, ILIASObjectActionSuccess } from "./object-action";
var SynchronizeAction = /** @class */ (function (_super) {
    __extends(SynchronizeAction, _super);
    function SynchronizeAction(title, object, sync, modal, translate) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.object = object;
        _this.sync = sync;
        _this.modal = modal;
        _this.translate = translate;
        return _this;
    }
    SynchronizeAction.prototype.execute = function () {
        var _this = this;
        return this.sync.liveLoad(this.object)
            .then(function () { return Promise.resolve(new ILIASObjectActionSuccess(_this.translate.instant("sync.object_synced", { title: _this.object.title }))); });
    };
    SynchronizeAction.prototype.alert = function () {
        return null;
    };
    return SynchronizeAction;
}(ILIASObjectAction));
export { SynchronizeAction };
//# sourceMappingURL=synchronize-action.js.map