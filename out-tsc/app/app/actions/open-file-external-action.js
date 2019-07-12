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
import { ILIASObjectAction, ILIASObjectActionNoMessage } from "./object-action";
var OpenFileExternalAction = /** @class */ (function (_super) {
    __extends(OpenFileExternalAction, _super);
    function OpenFileExternalAction(title, fileObject, file) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.fileObject = fileObject;
        _this.file = file;
        return _this;
    }
    OpenFileExternalAction.prototype.execute = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.file.existsFile(_this.fileObject).then(function () {
                _this.file.open(_this.fileObject).then(function () {
                    resolve(new ILIASObjectActionNoMessage());
                }, function (error) {
                    reject(error);
                });
            }, function (error) {
                reject(error);
            });
        });
    };
    OpenFileExternalAction.prototype.alert = function () {
        return null;
    };
    return OpenFileExternalAction;
}(ILIASObjectAction));
export { OpenFileExternalAction };
//# sourceMappingURL=open-file-external-action.js.map