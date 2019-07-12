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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { User } from "../models/user";
import { Settings } from "../models/settings";
/** logging */
import { Log } from "../services/log.service";
/** misc */
import { ILIASObjectActionNoMessage, ILIASObjectActionSuccess, ILIASObjectAction } from "./object-action";
import { OfflineException } from "../exceptions/OfflineException";
var DownloadFileAction = /** @class */ (function (_super) {
    __extends(DownloadFileAction, _super);
    function DownloadFileAction(title, fileObject, file, translate, alerter) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.fileObject = fileObject;
        _this.file = file;
        _this.translate = translate;
        _this.alerter = alerter;
        _this.title = title;
        return _this;
    }
    DownloadFileAction.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Download is only executed if a newer version is available in ILIAS
                        Log.write(this, "Do we need to download the file first? ", this.fileObject.needsDownload);
                        if (this.fileObject.needsDownload && this.file.isOffline())
                            throw new OfflineException("File requireds download and is offline at the same time.");
                        if (this.fileObject.needsDownload)
                            return [2 /*return*/, this.wlanAndDownload()];
                        return [4 /*yield*/, this.file.open(this.fileObject)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, new ILIASObjectActionNoMessage()];
                }
            });
        });
    };
    DownloadFileAction.prototype.wlanAndDownload = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            User.find(_this.fileObject.userId).then(function (user) {
                Settings.findByUserId(user.id).then(function (settings) {
                    if (settings.shouldntDownloadBecauseOfWLAN()) {
                        var alert_1 = _this.alerter.create({
                            header: _this.translate.instant("actions.download_without_wlan"),
                            message: _this.translate.instant("actions.download_without_wlan_continue"),
                            buttons: [
                                {
                                    text: _this.translate.instant("cancel"),
                                    role: "cancel",
                                    handler: function () {
                                        resolve(new ILIASObjectActionNoMessage());
                                    }
                                },
                                {
                                    text: "Ok",
                                    handler: function () {
                                        _this.download(resolve, reject);
                                    }
                                }
                            ]
                        }).then(function (it) { it.present(); return undefined; });
                    }
                    else {
                        _this.download(resolve, reject);
                    }
                });
            });
        });
    };
    DownloadFileAction.prototype.download = function (resolve, reject) {
        var _this = this;
        this.file.download(this.fileObject, true).then(function () {
            resolve(new ILIASObjectActionSuccess(_this.translate.instant("actions.download_successful")));
        }, function (error) {
            Log.describe(_this, "Could not download file: ", error);
            reject(new Error(_this.translate.instant("actions.offline_and_no_local_file")));
        });
    };
    ;
    DownloadFileAction.prototype.alert = function () {
        return undefined;
    };
    return DownloadFileAction;
}(ILIASObjectAction));
export { DownloadFileAction };
//# sourceMappingURL=download-file-action.js.map