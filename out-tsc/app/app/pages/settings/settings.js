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
import { Component, Inject, NgZone } from "@angular/core";
import { NavController, ToastController, AlertController, Config } from "@ionic/angular";
/** services */
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { FileService } from "../../services/file.service";
import { User } from "../../models/user";
import { FileData } from "../../models/file-data";
import { DesktopItem } from "../../models/desktop-item";
/** logging */
import { Log } from "../../services/log.service";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { CONFIG_PROVIDER } from "../../config/ilias-config";
import { DataProvider } from "../../providers/data-provider.provider";
import { TranslateService } from "@ngx-translate/core";
var SettingsPage = /** @class */ (function () {
    function SettingsPage(nav, toast, footerToolbar, translate, configProvider, alert, dataProvider, fileService, config, ngZone) {
        this.nav = nav;
        this.toast = toast;
        this.footerToolbar = footerToolbar;
        this.translate = translate;
        this.configProvider = configProvider;
        this.alert = alert;
        this.dataProvider = dataProvider;
        this.fileService = fileService;
        this.config = config;
        this.ngZone = ngZone;
        this.settingsMode = "general";
        this.totalSize = 0;
        /**
         * Stores the users per installation together with their used disk space on the device
         */
        this.usersPerInstallation = {};
        this.log = Logging.getLogger(SettingsPage_1.name);
    }
    SettingsPage_1 = SettingsPage;
    SettingsPage.prototype.ionViewDidEnter = function () {
        var _this = this;
        this.ngZone.run(function () { return _this.init(); });
    };
    SettingsPage.prototype.init = function () {
        var _this = this;
        // Load settings of current user
        User.currentUser()
            .then(function (user) {
            _this.loggedInUser = user;
            return user.settings;
        })
            .then(function (settings) {
            _this.settings = settings;
            return Promise.resolve();
        });
        // Load all users of current app showing the used disk space
        this.loadUsersAndDiskspace();
    };
    SettingsPage.prototype.loadUsersAndDiskspace = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, users, _i, users_1, user, diskSpace;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.usersPerInstallation = [];
                        this.totalSize = 0;
                        Log.write(this, "loading users and diskspace");
                        return [4 /*yield*/, this.configProvider.loadConfig()];
                    case 1:
                        config = _a.sent();
                        this.installationsWithUsers = config.installations;
                        return [4 /*yield*/, User.findAllUsers()];
                    case 2:
                        users = _a.sent();
                        _i = 0, users_1 = users;
                        _a.label = 3;
                    case 3:
                        if (!(_i < users_1.length)) return [3 /*break*/, 6];
                        user = users_1[_i];
                        if (!this.usersPerInstallation[user.installationId]) {
                            this.usersPerInstallation[user.installationId] = [];
                        }
                        return [4 /*yield*/, FileData.getTotalDiskSpaceForUser(user)];
                    case 4:
                        diskSpace = _a.sent();
                        this.usersPerInstallation[user.installationId].push({
                            user: user,
                            diskSpace: diskSpace
                        });
                        this.totalSize += diskSpace;
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        // Remove installations not having any users
                        this.installationsWithUsers = this.installationsWithUsers.filter(function (installation) {
                            return installation.id in _this.usersPerInstallation;
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SettingsPage.prototype.deleteLocalUserDataPrompt = function (user) {
        var _this = this;
        this.alert.create({
            header: this.translate.instant("settings.delete_user_local_data_title", { "username": user.iliasLogin }),
            message: this.translate.instant("settings.delete_user_local_data_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                    handler: function () {
                        // alert.dismiss();
                    }
                },
                {
                    text: this.translate.instant("ok"),
                    handler: function () {
                        _this.deleteLocalUserData(user);
                    }
                }
            ]
        }).then(function (it) { return it.present(); });
    };
    SettingsPage.prototype.saveSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.settings.downloadSize = Math.min(this.settings.downloadSize, 9999);
                        this.settings.quotaSize = Math.min(this.settings.quotaSize, 99999);
                        if (!this.settings.userId) return [3 /*break*/, 7];
                        this.log.debug(function () { return "Saving settings."; });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.settings.save()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log("ERR " + e_1.message);
                        return [3 /*break*/, 4];
                    case 4:
                        this.log.info(function () { return "Settings saved successfully."; });
                        return [4 /*yield*/, this.translate.use(this.settings.language).toPromise()];
                    case 5:
                        _a.sent();
                        this.log.trace(function () { return "Switching language successful."; });
                        this.config.set("backButtonText", this.translate.instant("back"));
                        return [4 /*yield*/, this.toast.create({
                                message: this.translate.instant("settings.settings_saved"),
                                duration: 3000
                            }).then(function (it) { return it.present(); })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SettingsPage.prototype.deleteLocalUserData = function (user) {
        var _this = this;
        this.footerToolbar.addJob(Job.DeleteFilesSettings, this.translate.instant("settings.deleting_files"));
        return this.deleteFiles(user)
            .then(function () { return _this.loadUsersAndDiskspace(); })
            .then(function () {
            _this.showFilesDeletedToast();
            _this.footerToolbar.removeJob(Job.DeleteFilesSettings);
            return Promise.resolve();
        }).catch(function (err) {
            _this.footerToolbar.removeJob(Job.DeleteFilesSettings);
            return Promise.reject(err);
        });
    };
    SettingsPage.prototype.showFilesDeletedToast = function () {
        this.toast.create({
            message: this.translate.instant("settings.files_deleted"),
            duration: 3000
        }).then(function (it) { return it.present(); });
    };
    SettingsPage.prototype.showFilesDeletingToast = function () {
        this.toast.create({
            message: this.translate.instant("Deleting files"),
            duration: 2000
        }).then(function (it) { return it.present(); });
    };
    SettingsPage.prototype.doDeleteAllFiles = function () {
        return __awaiter(this, void 0, void 0, function () {
            var users, _i, users_2, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.findAllUsers()];
                    case 1:
                        users = _a.sent();
                        _i = 0, users_2 = users;
                        _a.label = 2;
                    case 2:
                        if (!(_i < users_2.length)) return [3 /*break*/, 5];
                        user = users_2[_i];
                        return [4 /*yield*/, this.deleteFiles(user)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SettingsPage.prototype.deleteAllFilesPrompt = function () {
        var _this = this;
        this.alert.create({
            header: this.translate.instant("settings.delete_all_files"),
            message: this.translate.instant("settings.delete_all_files_text"),
            buttons: [
                {
                    text: this.translate.instant("cancel"),
                    role: "cancel",
                    handler: function () { }
                },
                {
                    text: this.translate.instant("ok"),
                    handler: function () {
                        _this.showFilesDeletingToast();
                        _this.footerToolbar.addJob(Job.DeleteFilesSettings, _this.translate.instant("settings.deleting_files"));
                        _this.doDeleteAllFiles().then(function () {
                            _this.loadUsersAndDiskspace().then(function () {
                                _this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                                _this.showFilesDeletedToast();
                            }).catch(function (error) {
                                _this.log.error(function () { return "Unable to load user and disk space with error " + JSON.stringify(error); });
                                _this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                                _this.showUnknownErrorOccurredAlert();
                            });
                        }).catch(function () {
                            _this.log.error(function () { return "Unable to delete all files."; });
                            _this.footerToolbar.removeJob(Job.DeleteFilesSettings);
                            _this.showUnknownErrorOccurredAlert();
                        });
                    }
                }
            ]
        }).then(function (it) { return it.present; });
    };
    SettingsPage.prototype.deleteFiles = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var iliasObjects, _i, iliasObjects_1, iliasObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DesktopItem.findByUserId(user.id)];
                    case 1:
                        iliasObjects = _a.sent();
                        _i = 0, iliasObjects_1 = iliasObjects;
                        _a.label = 2;
                    case 2:
                        if (!(_i < iliasObjects_1.length)) return [3 /*break*/, 5];
                        iliasObject = iliasObjects_1[_i];
                        return [4 /*yield*/, this.fileService.removeRecursive(iliasObject)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SettingsPage.prototype.showUnknownErrorOccurredAlert = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.alert.create({
                            header: this.translate.instant("something_went_wrong"),
                            buttons: [
                                {
                                    text: this.translate.instant("close"),
                                    cssClass: "alertButton",
                                    role: "cancel"
                                }
                            ]
                        }).then(function (it) { return it.present(); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var SettingsPage_1;
    SettingsPage = SettingsPage_1 = __decorate([
        Component({
            templateUrl: "settings.html"
        }),
        __param(4, Inject(CONFIG_PROVIDER)),
        __metadata("design:paramtypes", [NavController,
            ToastController,
            FooterToolbarService,
            TranslateService, Object, AlertController,
            DataProvider,
            FileService,
            Config,
            NgZone])
    ], SettingsPage);
    return SettingsPage;
}());
export { SettingsPage };
//# sourceMappingURL=settings.js.map