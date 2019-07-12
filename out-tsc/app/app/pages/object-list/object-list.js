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
import { ActivatedRoute } from "@angular/router";
import { ActionSheetController, AlertController, ModalController, NavController, ToastController } from "@ionic/angular";
/** ionic-native */
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { FileService } from "../../services/file.service";
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { LINK_BUILDER } from "../../services/link/link-builder.service";
import { SynchronizationService } from "../../services/synchronization.service";
/** models */
import { DesktopItem } from "../../models/desktop-item";
import { ILIASObject } from "../../models/ilias-object";
import { PageLayout } from "../../models/page-layout";
import { TimeLine } from "../../models/timeline";
import { User } from "../../models/user";
import { Favorites } from "../../models/favorites";
/** actions */
import { DownloadAndOpenFileExternalAction } from "../../actions/download-and-open-file-external-action";
import { MarkAsFavoriteAction } from "../../actions/mark-as-favorite-action";
import { ILIASObjectActionSuccess } from "../../actions/object-action";
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY } from "../../actions/open-object-in-ilias-action";
import { RemoveLocalFileAction } from "../../actions/remove-local-file-action";
import { RemoveLocalFilesAction } from "../../actions/remove-local-files-action";
import { ShowDetailsPageAction } from "../../actions/show-details-page-action";
import { ShowObjectListPageAction } from "../../actions/show-object-list-page-action";
import { SynchronizeAction } from "../../actions/synchronize-action";
import { UnMarkAsFavoriteAction } from "../../actions/unmark-as-favorite-action";
//TODO lp import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceActionFunction} from "../../actions/open-learnplace-action";
//TODO lp import {REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION, RemoveLocalLearnplaceActionFunction} from "../../actions/remove-local-learnplace-action";
/** logging */
import { Log } from "../../services/log.service";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { TranslateService } from "@ngx-translate/core";
import { Exception } from "../../exceptions/Exception";
import { DataProvider } from "../../providers/data-provider.provider";
var ObjectListPage = /** @class */ (function () {
    function ObjectListPage(nav, route, actionSheet, file, sync, modal, alert, toast, translate, dataProvider, ngZone, footerToolbar, browser, openInIliasActionFactory, 
    //TODO lp @Inject(OPEN_LEARNPLACE_ACTION_FACTORY)
    //TODO lp private readonly openLearnplaceActionFactory: OpenLearnplaceActionFunction,
    //TODO lp @Inject(REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION)
    //TODO lp private readonly removeLocalLearnplaceActionFactory: RemoveLocalLearnplaceActionFunction,
    linkBuilder) {
        var _this = this;
        this.nav = nav;
        this.route = route;
        this.actionSheet = actionSheet;
        this.file = file;
        this.sync = sync;
        this.modal = modal;
        this.alert = alert;
        this.toast = toast;
        this.translate = translate;
        this.dataProvider = dataProvider;
        this.ngZone = ngZone;
        this.footerToolbar = footerToolbar;
        this.browser = browser;
        this.openInIliasActionFactory = openInIliasActionFactory;
        this.linkBuilder = linkBuilder;
        /**
         * Objects under the given parent object
         */
        this.objects = [];
        this.state = {
            favorites: undefined,
            online: undefined,
            loadingLive: false,
            loadingOffline: false,
            refreshing: false,
            desktop: undefined
        };
        this.log = Logging.getLogger(ObjectListPage_1.name);
        this.route.queryParams.subscribe(function (params) {
            _this.parent = params["parent"];
            _this.state.favorites = Boolean(params["favorites"]);
            console.log("params: parent " + ((_this.parent) ? _this.parent.title : "undefined") + " favorites " + _this.state.favorites);
        });
        if (this.parent) {
            this.pageTitle = this.parent.title;
            this.pageLayout = new PageLayout(this.parent.type);
            this.timeline = new TimeLine(this.parent.type);
        }
        else {
            this.pageTitle = ""; // will be updated by the observer
            var key = (this.state.favorites) ? "favorites.title" : "object-list.title";
            translate.get(key).subscribe(function (lng) { return _this.pageTitle = lng; });
            this.pageLayout = new PageLayout();
            this.timeline = new TimeLine();
        }
    }
    ObjectListPage_1 = ObjectListPage;
    /**
     * load the content for the chosen ILIASObject
     */
    ObjectListPage.prototype.ionViewWillEnter = function () {
        var _this = this;
        this.ngZone.run(function () { return _this.loadContent(); });
        this.log.trace(function () { return "Ion view will enter page object list. favorites is " + _this.state.favorites; });
    };
    /**
     * Loads the current User and updates this.user if the result is valid
     */
    ObjectListPage.prototype.updateUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.currentUser()];
                    case 1:
                        newUser = _a.sent();
                        if (newUser !== undefined)
                            this.user = newUser;
                        if (this.user === undefined)
                            console.warn("in the page object-list, this.user is undefined");
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the state-object of the page
     */
    ObjectListPage.prototype.updatePageState = function () {
        //this.state.favorites = this.params.get("favorites"); TODO migration still necessary?
        this.state.online = window.navigator.onLine;
        this.state.loadingLive = SynchronizationService.state.liveLoading;
        this.state.loadingOffline = SynchronizationService.state.loadingOfflineContent;
        this.state.desktop = this.parent === undefined;
    };
    /**
     * Checks whether the page is in a given state
     */
    ObjectListPage.prototype.checkPageState = function (state) {
        this.updatePageState();
        for (var p in state)
            if (state[p] !== this.state[p])
                return false;
        return true;
    };
    /**
     * Opens the parent object in ILIAS.
     */
    ObjectListPage.prototype.openPageLayout = function () {
        this.checkParent();
        var action = this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(this.parent.refId));
        this.executeAction(action);
    };
    /**
     * Opens the timeline of the parent object in ILIAS.
     */
    ObjectListPage.prototype.openTimeline = function () {
        this.checkParent();
        var action = this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.timeline().target(this.parent.refId));
        this.executeAction(action);
    };
    /**
     * Switches to Favourites-tab
     */
    ObjectListPage.prototype.switchToFavoritesTab = function () {
        //TODO migration this.nav.parent.select(3);
    };
    /**
     * Checks the parent on null
     * @throws Exception if the parent is null
     */
    ObjectListPage.prototype.checkParent = function () {
        if (this.parent == undefined) {
            throw new Exception("Can not open link for undefined. Do not call this method on ILIAS objects with no parent.");
        }
    };
    /**
     * called by pull-to-refresh refresher
     * @returns {Promise<void>}
     */
    ObjectListPage.prototype.loadContent = function (event) {
        if (event === void 0) { event = undefined; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (event)
                            this.state.refreshing = true;
                        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
                        this.updatePageState();
                        if (!this.state.favorites) return [3 /*break*/, 4];
                        if (!(this.state.online && this.state.refreshing)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sync.loadAllOfflineContent()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.loadFavoritesObjectList()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        if (!this.state.online) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.liveLoadContent()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.loadCachedObjects(this.parent === undefined)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        event.target.complete();
                        this.state.refreshing = false;
                        this.footerToolbar.removeJob(Job.Synchronize);
                        this.updatePageState();
                        console.log(JSON.stringify(this.state));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * loads available content without synchronization and user-feedback
     * @returns {Promise<void>}
     */
    ObjectListPage.prototype.refreshContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.state.favorites) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadFavoritesObjectList()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.loadCachedObjects(this.parent === undefined)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.updatePageState();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * live-load content from account
     * @returns {Promise<void>}
     */
    ObjectListPage.prototype.liveLoadContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        Log.write(this, "Sync start", [], []);
                        return [4 /*yield*/, this.sync.liveLoad(this.parent)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        Log.error(this, error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * load content from favorites
     * @returns {Promise<void>}
     */
    ObjectListPage.prototype.loadFavoritesObjectList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.parent === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateUser()];
                    case 1:
                        _a.sent();
                        Favorites.findByUserId(this.user.id)
                            .then(function (favorites) {
                            favorites.sort(ILIASObject.compare);
                            _this.objects = favorites;
                        });
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.loadCachedObjects(false)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loads the object data from db cache.
     * @returns {Promise<void>}
     */
    ObjectListPage.prototype.loadCachedObjects = function (isDesktopObject) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.updateUser()];
                    case 1:
                        _c.sent();
                        _a = this;
                        if (!(isDesktopObject)) return [3 /*break*/, 3];
                        return [4 /*yield*/, DesktopItem.findByUserId(this.user.id)];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, ILIASObject.findByParentRefId(this.parent.refId, this.user.id)];
                    case 4:
                        _b = _c.sent();
                        _c.label = 5;
                    case 5:
                        _a.objects = _b;
                        this.objects.sort(ILIASObject.compare);
                        return [2 /*return*/, Promise.resolve()];
                    case 6:
                        error_2 = _c.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    ObjectListPage.prototype.onClick = function (iliasObject) {
        var primaryAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);
        // When executing the primary action, we reset the isNew state
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    };
    /**
     * Returns the primary action for the given object
     * @param iliasObject
     * @returns {ILIASObjectAction}
     */
    ObjectListPage.prototype.getPrimaryAction = function (iliasObject) {
        if (iliasObject.isLinked()) {
            return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
        }
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject);
        }
        if (iliasObject.isLearnplace()) {
            //TODO lp return this.openLearnplaceActionFactory(this.nav, iliasObject.objId, iliasObject.title, this.modal);
        }
        if (iliasObject.type == "file") {
            return new DownloadAndOpenFileExternalAction(this.translate.instant("actions.download_and_open_in_external_app"), iliasObject, this.file, this.translate, this.alert);
        }
        return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
    };
    ObjectListPage.prototype.executeAction = function (action) {
        var _this = this;
        //const hash: number = action.instanceId();
        //this.footerToolbar.addJob(hash, "");
        action.execute().then(function (result) {
            _this.handleActionResult(result);
            //this.footerToolbar.removeJob(hash);
        }).catch(function (error) {
            _this.log.warn(function () { return "Could not execute action: action=" + action.constructor.name + ", error=" + JSON.stringify(error); });
            //this.footerToolbar.removeJob(hash);
            throw error;
        }).then(function () { return _this.refreshContent(); });
    };
    ObjectListPage.prototype.executeSetFavoriteValueAction = function (iliasObject, value) {
        this.updatePageState();
        if (!this.state.online)
            return;
        var actions = [];
        if (value)
            this.applyMarkAsFavoriteAction(actions, iliasObject);
        else
            this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.executeAction(actions.pop());
    };
    ObjectListPage.prototype.handleActionResult = function (result) {
        if (!result)
            return;
        if (result instanceof ILIASObjectActionSuccess) {
            if (result.message) {
                this.toast.create({
                    message: result.message,
                    duration: 3000
                }).then(function (it) { return it.present(); });
            }
        }
    };
    /**
     * Show the action sheet for the given object
     * @param iliasObject
     */
    ObjectListPage.prototype.showActions = function (iliasObject) {
        this.updatePageState();
        var actions = [];
        this.applyDefaultActions(actions, iliasObject);
        this.applyMarkAsFavoriteAction(actions, iliasObject);
        this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.applySynchronizeAction(actions, iliasObject);
        this.applyRemoveLocalFileAction(actions, iliasObject);
        this.applyRemoveLearnplaceAction(actions, iliasObject);
        /* TODO migration
        const buttons: Array<ActionSheetButton> = actions.map(action => {

            return <ActionSheetButton>{
                text: action.title,
                handler: (): void => {
                    // This action displays an alert before it gets executed
                    if (action.alert()) {
                        this.alert.create({
                            title: action.alert().title,
                            subTitle: action.alert().subTitle,
                            buttons: [
                                {
                                    text: this.translate.instant("cancel"),
                                    role: "cancel"
                                },
                                {
                                    text: "Ok",
                                    handler: (): void => {
                                        this.executeAction(action);
                                    }
                                }
                            ]
                        }).present();
                    } else {
                        this.executeAction(action);
                    }
                }
            };

        });

        buttons.push(<ActionSheetButton>{
            text: this.translate.instant("cancel"),
            role: "cancel",
            handler: (): void => {
            }
        });

        const options: ActionSheetOptions = {
            title: iliasObject.title,
            buttons: buttons
        };
        const actionSheet: ActionSheet = this.actionSheet.create(options);
        actionSheet.present();*/
    };
    ObjectListPage.prototype.applyDefaultActions = function (actions, iliasObject) {
        actions.push(new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav));
        if (this.state.online)
            actions.push(this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId)));
    };
    ObjectListPage.prototype.applyMarkAsFavoriteAction = function (actions, iliasObject) {
        if (!iliasObject.isFavorite && this.state.online) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject, this.sync));
        }
    };
    ObjectListPage.prototype.applyUnmarkAsFavoriteAction = function (actions, iliasObject) {
        if (iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject, this.file));
        }
    };
    ObjectListPage.prototype.applySynchronizeAction = function (actions, iliasObject) {
        if (iliasObject.isOfflineAvailable && this.state.online && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM
            && (iliasObject.isContainer() && !iliasObject.isLinked() && !iliasObject.isLearnplace()
                ||
                    iliasObject.isFile())) {
            actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
        }
    };
    ObjectListPage.prototype.applyRemoveLocalFileAction = function (actions, iliasObject) {
        if (iliasObject.isContainer() && !iliasObject.isLinked() && !iliasObject.isLearnplace()) {
            actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), iliasObject, this.file, this.translate));
        }
        if (iliasObject.isFile())
            actions.push(new RemoveLocalFileAction(this.translate.instant("actions.remove_local_file"), iliasObject, this.file, this.translate));
    };
    ObjectListPage.prototype.applyRemoveLearnplaceAction = function (actions, iliasObject) {
        /*TODO lp if(iliasObject.isLearnplace())
            actions.push(this.removeLocalLearnplaceActionFactory(
                this.translate.instant("actions.remove_local_learnplace"), iliasObject.objId, iliasObject.userId)
            );*/
    };
    var ObjectListPage_1;
    ObjectListPage = ObjectListPage_1 = __decorate([
        Component({
            selector: "page-desktop",
            templateUrl: "object-list.html",
        }),
        __param(13, Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)),
        __param(14, Inject(LINK_BUILDER)),
        __metadata("design:paramtypes", [NavController,
            ActivatedRoute,
            ActionSheetController,
            FileService,
            SynchronizationService,
            ModalController,
            AlertController,
            ToastController,
            TranslateService,
            DataProvider,
            NgZone,
            FooterToolbarService,
            InAppBrowser, Function, Object])
    ], ObjectListPage);
    return ObjectListPage;
}());
export { ObjectListPage };
//# sourceMappingURL=object-list.js.map