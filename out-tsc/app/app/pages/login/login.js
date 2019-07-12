var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
import { Component, Inject } from "@angular/core";
import { Events, Platform } from "@ionic/angular";
/** ionic-native */
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Toast } from "@ionic-native/toast/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
/** models */
import { User } from "../../models/user";
import { Settings } from "../../models/settings";
/** logging */
import { Log } from "../../services/log.service";
/** misc */
import { SynchronizationService } from "../../services/synchronization.service";
import { CONFIG_PROVIDER, ILIASConfigProvider } from "../../config/ilias-config";
var LoginPage = /** @class */ (function () {
    function LoginPage(platform, sync, configProvider, toast, event, browser, appVersionPlugin) {
        var _this = this;
        this.platform = platform;
        this.sync = sync;
        this.configProvider = configProvider;
        this.toast = toast;
        this.event = event;
        this.browser = browser;
        this.appVersionPlugin = appVersionPlugin;
        this.installations = [];
        this.configProvider.loadConfig().then(function (config) {
            var _a;
            (_a = _this.installations).push.apply(_a, config.installations);
            _this.installationId = _this.installations[0].id;
        });
        this.appVersionStr = this.appVersionPlugin.getVersionNumber();
    }
    LoginPage.prototype.login = function () {
        var _this = this;
        var installation = this.getSelectedInstallation();
        var url = installation.url + "/login.php?target=ilias_app_oauth2&client_id=" + installation.clientId;
        var options = {
            location: "no", clearsessioncache: "yes", clearcache: "yes"
        };
        var browser = this.browser.create(url, "_blank", options);
        Log.describe(this, "inappBrowser", browser);
        browser.on("loadstop").subscribe(function () {
            // Fetch data from inAppBrowser
            Log.write(_this, "Loadstop registered.");
            browser.executeScript({ code: 'document.getElementById("data").value' }).then(function (encodedData) {
                if (encodedData.length) {
                    Log.write(_this, "Login successfull from script");
                    // Data is an array with the following chunks: iliasUserId, iliasLogin, accessToken, refreshToken
                    var data = encodedData[0].split("|||");
                    Log.describe(_this, "Data received from OAuth", data);
                    _this.saveUser(data[0], data[1], data[2], data[3]).then(function () {
                        Log.write(_this, "User saved.");
                        browser.close();
                    }, function (err) {
                        Log.error(_this, err);
                        browser.close();
                    });
                }
            });
        });
        browser.on("exit").subscribe(function () {
            Log.write(_this, "exit browser.");
            _this.checkLogin()
                .then(function () { return _this.updateLastVersionLogin(); })
                .then(function () { return _this.checkAndLoadOfflineContent(); });
        });
    };
    /**
     * Checks if an active user is found in the app and redirects to desktop.
     * If no active user is found, the login mechanism went wrong --> display same page again
     */
    LoginPage.prototype.checkLogin = function () {
        var _this = this;
        console.log("[ [ checking login ] ]");
        return User.currentUser().then(function () {
            Log.write(_this, "got user.");
            _this.event.publish("login");
            console.log("yay!");
        }, function () {
            Log.write(_this, "Login went wrong....");
            _this.toast.showShortTop("Login failed");
            console.log("nay!");
        });
    };
    /**
     * update the value lastVersionLogin for the user after login
     */
    LoginPage.prototype.updateLastVersionLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, User.currentUser()];
                    case 1:
                        user = _b.sent();
                        _a = user;
                        return [4 /*yield*/, this.appVersionStr];
                    case 2:
                        _a.lastVersionLogin = _b.sent();
                        return [4 /*yield*/, user.save()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * if downloadOnStart is enabled, synchronize all offline-data after login
     */
    LoginPage.prototype.checkAndLoadOfflineContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.currentUser()];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, Settings.findByUserId(user.id)];
                    case 2:
                        settings = _a.sent();
                        if (settings.downloadOnStart && window.navigator.onLine)
                            this.sync.loadAllOfflineContent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create or update existing user
     * @param iliasUserId
     * @param iliasLogin
     * @param accessToken
     * @param refreshToken
     */
    LoginPage.prototype.saveUser = function (iliasUserId, iliasLogin, accessToken, refreshToken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            User.findByILIASUserId(iliasUserId, _this.installationId).then(function (user) {
                Log.write(_this, "found user with ilias id" + iliasUserId);
                Log.describe(_this, "refreshtoken: ", refreshToken);
                user.accessToken = accessToken;
                user.iliasLogin = iliasLogin;
                user.refreshToken = refreshToken;
                user.lastTokenUpdate = Date.now();
                user.save().then(function () {
                    resolve();
                }, function (err) {
                    Log.error(_this, err);
                    reject();
                });
            }, function (err) {
                reject(err);
            });
        });
    };
    /**
     * @returns {ILIASInstallation}
     */
    LoginPage.prototype.getSelectedInstallation = function () {
        var _this = this;
        return this.installations.filter(function (installation) {
            return (installation.id == _this.installationId);
        })[0];
    };
    LoginPage = __decorate([
        Component({
            templateUrl: "login.html",
            providers: [Toast]
        }),
        __param(2, Inject(CONFIG_PROVIDER)),
        __metadata("design:paramtypes", [Platform,
            SynchronizationService,
            ILIASConfigProvider,
            Toast,
            Events,
            InAppBrowser,
            AppVersion])
    ], LoginPage);
    return LoginPage;
}());
export { LoginPage };
//# sourceMappingURL=login.js.map