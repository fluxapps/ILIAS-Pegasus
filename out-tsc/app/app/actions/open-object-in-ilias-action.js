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
/** angular */
import { InjectionToken } from "@angular/core";
import { Logging } from "../services/logging/logging.service";
/** misc */
import { ILIASObjectAction, ILIASObjectActionNoMessage } from "./object-action";
import { IllegalStateError } from "../error/errors";
import { LeaveAppDialog } from "../fallback/open-browser/leave-app.dialog";
var OpenObjectInILIASAction = /** @class */ (function (_super) {
    __extends(OpenObjectInILIASAction, _super);
    function OpenObjectInILIASAction(title, target, browser, platform, modal) {
        var _this = _super.call(this) || this;
        _this.title = title;
        _this.target = target;
        _this.browser = browser;
        _this.platform = platform;
        _this.modal = modal;
        _this.log = Logging.getLogger(OpenObjectInILIASAction.name);
        return _this;
    }
    OpenObjectInILIASAction.prototype.execute = function () {
        var _this = this;
        return (function () { return __awaiter(_this, void 0, void 0, function () {
            var ilasLink;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.target.build()];
                    case 1:
                        ilasLink = _a.sent();
                        if (this.platform.is("android"))
                            this.openUserDialog(function () { return _this.openBrowserAndroid(ilasLink); });
                        else if (this.platform.is("ios"))
                            this.openUserDialog(function () { return _this.openBrowserIos(ilasLink); });
                        else
                            throw new IllegalStateError("Unsupported platform, unable to open browser for unsupported platform.");
                        return [2 /*return*/, new ILIASObjectActionNoMessage()];
                }
            });
        }); })();
    };
    OpenObjectInILIASAction.prototype.openUserDialog = function (leaveAction) {
        this.log.debug(function () { return "Open leave app modal."; });
        this.modal.create({
            component: LeaveAppDialog,
            componentProps: { leaveApp: leaveAction },
            cssClass: "modal-fullscreen"
        }).then(function (it) { return it.present(); });
    };
    OpenObjectInILIASAction.prototype.openBrowserIos = function (link) {
        this.log.trace(function () { return "Open ios browser (internal)."; });
        this.log.trace(function () { return "Navigate to url: " + link; });
        var options = {
            location: "no",
            clearcache: "yes",
            clearsessioncache: "yes"
        };
        //encode url or the browser will be stuck in a loading screen of death as soon as it reads the | character. (20.02.18)
        this.browser.create(encodeURI(link), "_blank", options);
    };
    OpenObjectInILIASAction.prototype.openBrowserAndroid = function (link) {
        this.log.trace(function () { return "Open android browser (external)."; });
        this.log.trace(function () { return "Navigate to url: " + link; });
        var options = {
            location: "yes",
            clearcache: "yes",
            clearsessioncache: "yes"
        };
        this.browser.create(encodeURI(link), "_system", options);
    };
    OpenObjectInILIASAction.prototype.alert = function () {
        return undefined;
    };
    return OpenObjectInILIASAction;
}(ILIASObjectAction));
export { OpenObjectInILIASAction };
export var OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY = new InjectionToken("token for open in ILIAS action");
//# sourceMappingURL=open-object-in-ilias-action.js.map