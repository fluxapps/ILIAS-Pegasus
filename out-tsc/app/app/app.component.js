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
import { Config, Events, MenuController, Platform, ToastController, ModalController, NavController } from "@ionic/angular";
/** ionic-native */
import { Network } from "@ionic-native/network/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { SQLite } from "@ionic-native/sqlite/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { AppVersion } from "@ionic-native/app-version/ngx";
/** services */
import { SQLiteDatabaseService } from "./services/database.service";
import { Database } from "./services/database/database";
import { FooterToolbarService, Job } from "./services/footer-toolbar.service";
import { Logging } from "./services/logging/logging.service";
import { DB_MIGRATION } from "./services/migration/migration.api";
import { SynchronizationService } from "./services/synchronization.service";
/** models */
import { Settings } from "./models/settings";
import { User } from "./models/user";
/** misc */
// TODO migration import {LogoutProvider} from "./providers/logout/logout";
var getMessage = Logging.getMessage;
import { TranslateService } from "@ngx-translate/core";
import { PEGASUS_CONNECTION_NAME } from "./config/typeORM-config";
import { OnboardingPage } from "./pages/onboarding/onboarding";
import { Router } from "@angular/router";
import { NavProvider } from "./providers/nav.provider";
var AppComponent = /** @class */ (function () {
    /**
     *
     * This constructor sets on classes which are not injectable yet
     * member instances. This is a workaround for Ionic 3 update with
     * the current app architecture. This will be changed on release 2.0.0.
     *
     */
    function AppComponent(footerToolbar, navCtrl, router, platform, menu, translate, event, toast, sync, statusBar, network, splashScreen, database, modal, config, 
    // TODO migration private readonly logoutCtrl: LogoutProvider,
    appVersionPlugin, dbMigration, sqlite) {
        var _this = this;
        this.footerToolbar = footerToolbar;
        this.navCtrl = navCtrl;
        this.router = router;
        this.platform = platform;
        this.menu = menu;
        this.translate = translate;
        this.event = event;
        this.toast = toast;
        this.sync = sync;
        this.statusBar = statusBar;
        this.network = network;
        this.splashScreen = splashScreen;
        this.database = database;
        this.modal = modal;
        this.config = config;
        this.appVersionPlugin = appVersionPlugin;
        this.dbMigration = dbMigration;
        this.loggedIn = false;
        this.log = Logging.getLogger(AppComponent_1.name);
        // Set members on classes which are not injectable
        Settings.NETWORK = this.network;
        SQLiteDatabaseService.SQLITE = sqlite;
        // init after platform is ready and native stuff is available
        this.platform.ready().then(function () {
            _this.log.info(function () { return "Platform is ready"; });
            return _this.initializeApp();
        }).catch(function (error) {
            var message = getMessage(error, "Error occurred: \n" + JSON.stringify(error));
            var errorType = (error instanceof Error) ? error.name : "N/a";
            _this.log.warn(function () { return "Could not initialize app. Error type: " + errorType + " Message: " + message; });
        });
    }
    AppComponent_1 = AppComponent;
    /**
     * Initialize everything that has to be done on start up.
     */
    AppComponent.prototype.initializeApp = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentAppVersion, settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log.info(function () { return "Initialize app"; });
                        this.statusBar.styleLightContent();
                        this.subscribeOnGlobalEvents();
                        this.defineBackButtonAction();
                        return [4 /*yield*/, this.database.ready(PEGASUS_CONNECTION_NAME)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dbMigration.migrate()];
                    case 2:
                        _a.sent();
                        //await this.router.navigate([""], {replaceUrl: true});
                        NavProvider.setInstance(this.navCtrl);
                        return [4 /*yield*/, this.manageLogin()];
                    case 3:
                        _a.sent();
                        // overwrite ionic back button text with configured language
                        this.config.set("backButtonText", this.translate.instant("back"));
                        this.splashScreen.hide();
                        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
                        if (!(this.user !== undefined)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.appVersionPlugin.getVersionNumber()];
                    case 4:
                        currentAppVersion = _a.sent();
                        if (this.user.lastVersionLogin !== currentAppVersion) {
                            // TODO migration await this.logoutCtrl.logout();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Settings.findByUserId(this.user.id)];
                    case 5:
                        settings = _a.sent();
                        if (!(settings.downloadOnStart && window.navigator.onLine)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.sync.loadAllOfflineContent()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        this.footerToolbar.removeJob(Job.Synchronize);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribes on global events that are used.
     */
    AppComponent.prototype.subscribeOnGlobalEvents = function () {
        var _this = this;
        this.event.subscribe("doLogout", function () { return _this.logout(); });
        this.event.subscribe("login", function () { return _this.manageLogin(); });
        this.event.subscribe("logout", function () { return _this.loggedIn = false; });
        this.network.onDisconnect().subscribe(function () { return _this.footerToolbar.offline = true; });
        this.network.onConnect().subscribe(function () { return _this.footerToolbar.offline = false; });
    };
    /**
     * Configures the translation and, if needed, displays the onboarding-modal
     *
     * If no current user is found, the default translation will be loaded and the onboarding-modal will be presented
     */
    AppComponent.prototype.manageLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        return [4 /*yield*/, User.currentUser()];
                    case 1:
                        user = _a.sent();
                        this.loggedIn = true;
                        this.user = user;
                        return [4 /*yield*/, this.configureTranslation(user)];
                    case 2:
                        _a.sent();
                        this.router.navigateByUrl("tabs");
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        this.configureDefaultTranslation();
                        return [4 /*yield*/, this.presentOnboardingModal()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configures the {@link TranslateService} depending on the given {@code user}.
     *
     * @param {User} user - the user to read its configured language
     */
    AppComponent.prototype.configureTranslation = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var setting;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.user !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Settings.findByUserId(user.id)];
                    case 1:
                        setting = _a.sent();
                        this.translate.use(setting.language);
                        return [3 /*break*/, 3];
                    case 2:
                        this.translate.use("de");
                        _a.label = 3;
                    case 3:
                        this.translate.setDefaultLang("de");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Configures the {@link TranslateService} by the {@link navigator}.
     */
    AppComponent.prototype.configureDefaultTranslation = function () {
        var userLang = navigator.language.split("-")[0];
        userLang = /(de|en)/gi.test(userLang) ? userLang : "de";
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang("de");
        this.translate.use(userLang);
    };
    /**
     * Performs all steps to log out the user.
     */
    // TODO migration Delete as it is now in logout provider
    AppComponent.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, toast;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.menu.close()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, User.currentUser()];
                    case 2:
                        user = _a.sent();
                        user.accessToken = undefined;
                        user.refreshToken = undefined;
                        return [4 /*yield*/, user.save()];
                    case 3:
                        _a.sent();
                        this.loggedIn = false;
                        return [4 /*yield*/, this.toast.create({
                                message: this.translate.instant("logout.logged_out"),
                                duration: 3000
                            })];
                    case 4:
                        toast = _a.sent();
                        return [4 /*yield*/, toast.present()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Registers a action for the back button.
     */
    AppComponent.prototype.defineBackButtonAction = function () {
        var backbuttonTapped = 0;
        /* TODO migration this.platform.registerBackButtonAction(() => {
        if (this.menu.isOpen()) {
          this.menu.close();
          return;
        }
        if (!this.nav.canGoBack()) {
          if (backbuttonTapped == 0) {
            backbuttonTapped = 1;
            const toast: Toast = this.toast.create({
              message: this.translate.instant("message.back_to_exit"),
              duration: 3000
            });
            toast.present();
            setTimeout(() => {
              backbuttonTapped = 0;
            }, 3000);
          } else {
            this.platform.exitApp();
          }
        } else {
          this.nav.pop();
        }
      });*/
    };
    // tslint:disable-next-line:typedef
    AppComponent.prototype.presentOnboardingModal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var onboardingModal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.modal.create({
                            component: OnboardingPage,
                            cssClass: "modal-fullscreen"
                        })];
                    case 1:
                        onboardingModal = _a.sent();
                        return [4 /*yield*/, onboardingModal.present()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    var AppComponent_1;
    AppComponent = AppComponent_1 = __decorate([
        Component({
            selector: "app-root",
            templateUrl: "app.component.html"
        }),
        __param(16, Inject(DB_MIGRATION)),
        __metadata("design:paramtypes", [FooterToolbarService,
            NavController,
            Router,
            Platform,
            MenuController,
            TranslateService,
            Events,
            ToastController,
            SynchronizationService,
            StatusBar,
            Network,
            SplashScreen,
            Database,
            ModalController,
            Config,
            AppVersion, Object, SQLite])
    ], AppComponent);
    return AppComponent;
}());
export { AppComponent };
//# sourceMappingURL=app.component.js.map