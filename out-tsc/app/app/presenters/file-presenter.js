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
import { GenericILIASObjectPresenter } from "./object-presenter";
import { ILIASAppUtils } from "../services/ilias-app-utils.service";
var FileObjectPresenter = /** @class */ (function (_super) {
    __extends(FileObjectPresenter, _super);
    function FileObjectPresenter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileObjectPresenter.prototype.icon = function () {
        return "assets/icon/obj_file.svg";
    };
    FileObjectPresenter.prototype.title = function () {
        return _super.prototype.title.call(this) + (" (" + this.getFormattedSize() + ")");
    };
    FileObjectPresenter.prototype.showTypeAsText = function () {
        return false;
    };
    FileObjectPresenter.prototype.details = function () {
        var _this = this;
        return _super.prototype.details.call(this).then(function (details) {
            var metaData = _this.iliasObject.data;
            details.push({ label: "details.availability", value: _this.getLanguageVariableForLocalFile(), translate: true });
            details.push({ label: "details.size", value: _this.getFormattedSize() });
            details.push({ label: "details.version", value: metaData.fileVersion });
            details.push({ label: "details.remote_version_date", value: metaData.fileVersionDate });
            if (metaData.hasOwnProperty("fileVersionDateLocal") && metaData.fileVersionDateLocal) {
                details.push({ label: "details.local_version_date", value: metaData.fileVersionDateLocal });
            }
            return Promise.resolve(details);
        });
    };
    FileObjectPresenter.prototype.getLanguageVariableForLocalFile = function () {
        if (this.fileReadyAndUpToDate()) {
            return "details.availabilities.up-to-date";
        }
        else if (this.fileReady()) {
            return "details.availabilities.needs_update";
        }
        return "details.availabilities.needs_download";
    };
    FileObjectPresenter.prototype.fileReady = function () {
        return (this.iliasObject.data.hasOwnProperty("fileVersionDateLocal") && this.iliasObject.data.fileVersionDateLocal);
    };
    FileObjectPresenter.prototype.fileReadyAndUpToDate = function () {
        return this.fileReady() && !this.iliasObject.needsDownload;
    };
    FileObjectPresenter.prototype.getFormattedSize = function () {
        return (this.iliasObject.data.hasOwnProperty("fileSize")) ? ILIASAppUtils.formatSize(this.iliasObject.data.fileSize) : "";
    };
    return FileObjectPresenter;
}(GenericILIASObjectPresenter));
export { FileObjectPresenter };
//# sourceMappingURL=file-presenter.js.map