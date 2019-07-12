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
var RemoveLocalFilesAction = /** @class */ (function (_super) {
    __extends(RemoveLocalFilesAction, _super);
    function RemoveLocalFilesAction(title, containerObject, file, translate) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.containerObject = containerObject;
        _this.file = file;
        _this.translate = translate;
        return _this;
    }
    RemoveLocalFilesAction.prototype.execute = function () {
        var _this = this;
        return this.file.removeRecursive(this.containerObject)
            .then(function () { return new ILIASObjectActionSuccess(_this.translate.instant("actions.removed_local_files")); });
    };
    RemoveLocalFilesAction.prototype.alert = function () {
        return {
            title: this.translate.instant("actions.remove_local_files_in", { title: this.containerObject.title }),
            subTitle: this.translate.instant("actions.remove_local_files_in_text"),
        };
    };
    return RemoveLocalFilesAction;
}(ILIASObjectAction));
export { RemoveLocalFilesAction };
//# sourceMappingURL=remove-local-files-action.js.map