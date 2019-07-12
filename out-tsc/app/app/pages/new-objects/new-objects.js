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
import { ActivatedRoute } from "@angular/router";
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController, ToastController } from "@ionic/angular";
/** ionic-native */
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
/** actions */
import { DownloadAndOpenFileExternalAction } from "../../actions/download-and-open-file-external-action";
import { MarkAsFavoriteAction } from "../../actions/mark-as-favorite-action";
import { ILIASObjectActionSuccess } from "../../actions/object-action";
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY } from "../../actions/open-object-in-ilias-action";
import { RemoveLocalFilesAction } from "../../actions/remove-local-files-action";
import { ShowDetailsPageAction } from "../../actions/show-details-page-action";
import { ShowObjectListPageAction } from "../../actions/show-object-list-page-action";
import { SynchronizeAction } from "../../actions/synchronize-action";
import { UnMarkAsFavoriteAction } from "../../actions/unmark-as-favorite-action";
/** exceptions */
import { CantOpenFileTypeException } from "../../exceptions/CantOpenFileTypeException";
import { OfflineException } from "../../exceptions/OfflineException";
import { RESTAPIException } from "../../exceptions/RESTAPIException";
import { DesktopItem } from "../../models/desktop-item";
import { ILIASObject } from "../../models/ilias-object";
import { User } from "../../models/user";
import { FileService } from "../../services/file.service";
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { LINK_BUILDER } from "../../services/link/link-builder.service";
import { SynchronizationService } from "../../services/synchronization.service";
/** logging */
import { Log } from "../../services/log.service";
import { Logging } from "../../services/logging/logging.service";
import { TranslateService } from "@ngx-translate/core";
import { DataProvider } from "../../providers/data-provider.provider";
var NewObjectsPage = /** @class */ (function () {
    function NewObjectsPage(nav, route, actionSheet, loading, file, sync, alert, toast, footerToolbar, translate, modal, dataProvider, browser, openInIliasActionFactory, linkBuilder) {
        var _this = this;
        this.nav = nav;
        this.route = route;
        this.actionSheet = actionSheet;
        this.loading = loading;
        this.file = file;
        this.sync = sync;
        this.alert = alert;
        this.toast = toast;
        this.footerToolbar = footerToolbar;
        this.translate = translate;
        this.modal = modal;
        this.dataProvider = dataProvider;
        this.browser = browser;
        this.openInIliasActionFactory = openInIliasActionFactory;
        this.linkBuilder = linkBuilder;
        this.log = Logging.getLogger(NewObjectsPage_1.name);
        /**
         * Objects under the given parent object
         */
        this.objects = {};
        this.actionSheetActive = false;
        this.desktopItems = [];
        this.allObjects = [];
        this.route.queryParams.subscribe(function (params) {
            _this.parent = params["parent"];
        });
        this.pageTitle = "New Content";
    }
    NewObjectsPage_1 = NewObjectsPage;
    /**
     * Only called if page is newly loaded
     */
    NewObjectsPage.prototype.ionViewDidLoad = function () {
        this.loadObjects();
    };
    NewObjectsPage.prototype.loadObjects = function () {
        var _this = this;
        User.currentUser().then(function (user) {
            _this.user = user;
            _this.loadObjectData();
        }, function () {
            // We should never get to this page if no user is logged in... just in case -> redirect to LoginPage
            // TODO migration this.nav.push(LoginPage);
        });
    };
    /**
     * Loads objects from local DB and then from remote
     */
    NewObjectsPage.prototype.loadObjectData = function () {
        var _this = this;
        Log.write(this, "Collecting new items from Database");
        this.footerToolbar.addJob(Job.LoadNewObjects, "");
        // we want to group the new items by course/group
        DesktopItem.findByUserId(this.user.id).then(function (desktopItems) {
            _this.desktopItems = [];
            _this.objects = {};
            _this.allObjects = [];
            var promises = [];
            desktopItems.forEach(function (desktopItem) {
                if (desktopItem.isContainer()) {
                    //get all the subitems by course/group
                    promises.push(ILIASObject.findByParentRefIdRecursive(desktopItem.refId, _this.user.id).then(function (objects) {
                        //filter out the new ones.
                        var newObjects = objects.filter(function (iliasObject) {
                            // return true;
                            return (iliasObject.isNew || iliasObject.isUpdated);
                        });
                        // add the new ones to the dictionary
                        newObjects.forEach(function (newObject) {
                            if (!_this.objects[desktopItem.refId]) {
                                _this.objects[desktopItem.refId] = [];
                            }
                            _this.objects[desktopItem.refId].push(newObject);
                            _this.allObjects.push(newObject);
                        });
                        Log.write(_this, "New objects for ", desktopItem);
                        Log.write(_this, "New dektopitem? ", desktopItem.isNew);
                        Log.write(_this, "Add new ", desktopItem.isNew == true);
                        Log.write(_this, "Found new objects", newObjects);
                        // only add course if there are new items in there.
                        if (_this.objects[desktopItem.refId] || desktopItem.isNew || desktopItem.isUpdated) {
                            Log.describe(_this, "Desktop items ", _this.desktopItems);
                            Log.write(_this, "adding desktop item.");
                            _this.desktopItems.push(desktopItem);
                            _this.objects[desktopItem.refId].sort(ILIASObject.compare);
                        }
                    }));
                }
            });
            return Promise.all(promises).then(function () {
                Log.write(_this, "Desktop items", _this.desktopItems);
                _this.footerToolbar.removeJob(Job.LoadNewObjects);
            });
        }).catch(function (error) {
            Log.write(_this, "Collecting new items failed", error);
            _this.footerToolbar.removeJob(Job.LoadNewObjects);
        });
    };
    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    NewObjectsPage.prototype.onClick = function (iliasObject) {
        if (this.actionSheetActive)
            return;
        var primaryAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);
        // When executing the primary action, we reset the isNew state
        //TODO: should be moved imho
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    };
    NewObjectsPage.prototype.markAllAsSeen = function () {
        var _this = this;
        var promises = [];
        this.desktopItems.forEach(function (deskItem) {
            var promise = _this.mark(deskItem.refId, _this.objects[deskItem.refId]);
            deskItem.isNew = false;
            deskItem.isUpdated = false;
            promises.push(promise);
            promises.push(deskItem.save());
        });
        Promise.all(promises).then(function () {
            _this.desktopItems = [];
            _this.allObjects = [];
            _this.objects = {};
        });
    };
    NewObjectsPage.prototype.markItemAsSeen = function (desktopItem, id) {
        var obj = this.allObjects.filter(function (object) {
            return object.id == id;
        });
        desktopItem.isNew = false;
        desktopItem.isUpdated = false;
        return Promise.all([desktopItem.save(), this.mark(desktopItem.refId, obj)]);
    };
    NewObjectsPage.prototype.markDesktopItemAsSeen = function (desktopItem) {
        var _this = this;
        return this.mark(desktopItem.refId, this.objects[desktopItem.refId]).then(function () {
            delete _this.objects[desktopItem.refId];
            Log.write(_this, "allObjects", _this.allObjects);
        });
    };
    /**
     * Returns the primary action for the given object
     * @param iliasObject
     * @returns {ILIASObjectAction}
     */
    NewObjectsPage.prototype.getPrimaryAction = function (iliasObject) {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject);
        }
        if (iliasObject.type === "file") {
            return new DownloadAndOpenFileExternalAction(this.translate.instant("actions.download_and_open_in_external_app"), iliasObject, this.file, this.translate, this.alert);
        }
        return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
    };
    /**
     * Show the action sheet for the given object
     * @param iliasObject
     */
    NewObjectsPage.prototype.showActions = function (iliasObject) {
        return __awaiter(this, void 0, void 0, function () {
            var actionButtons, actions, actionSheet;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.actionSheetActive = true;
                        actionButtons = [];
                        actions = [
                            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav),
                            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId)),
                        ];
                        if (iliasObject.isContainer()) {
                            if (!iliasObject.isFavorite) {
                                actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject, this.sync));
                            }
                            else if (iliasObject.isFavorite && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                                actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject, this.file));
                                actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
                            }
                            actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), iliasObject, this.file, this.translate));
                        }
                        actions.forEach(function (action) {
                            actionButtons.push({
                                text: action.title,
                                handler: function () {
                                    _this.actionSheetActive = false;
                                    // This action displays an alert before it gets executed
                                    if (action.alert()) {
                                        _this.alert.create({
                                            header: action.alert().title,
                                            message: action.alert().subTitle,
                                            buttons: [
                                                {
                                                    text: "Cancel",
                                                    role: "cancel"
                                                },
                                                {
                                                    text: "Ok",
                                                    handler: function () {
                                                        _this.executeAction(action);
                                                    }
                                                }
                                            ]
                                        }).then(function (it) { return it.present(); });
                                    }
                                    else {
                                        _this.executeAction(action);
                                    }
                                }
                            });
                        });
                        actionButtons.push({
                            text: this.translate.instant("cancel"),
                            role: "cancel",
                            handler: function () {
                                _this.actionSheetActive = false;
                            }
                        });
                        return [4 /*yield*/, this.actionSheet.create({
                                header: iliasObject.title,
                                buttons: actionButtons
                            })];
                    case 1:
                        actionSheet = _a.sent();
                        /* TODO migration actionSheet.onDidDismiss(() => {
                            this.actionSheetActive = false;
                        });*/
                        actionSheet.present();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param desktopItemRefId
     * @param objects
     * @returns {Promise<any>}
     */
    NewObjectsPage.prototype.mark = function (desktopItemRefId, objects) {
        return __awaiter(this, void 0, void 0, function () {
            var promises;
            var _this = this;
            return __generator(this, function (_a) {
                if (!objects) {
                    return [2 /*return*/];
                }
                promises = [];
                this.footerToolbar.addJob(Job.MarkFiles, "");
                objects.forEach(function (item) {
                    item.isNew = false;
                    item.isUpdated = false;
                    promises.push(item.save());
                    _this.removeFromList(desktopItemRefId, item);
                });
                return [2 /*return*/, Promise.all(promises).then(function () {
                        _this.footerToolbar.removeJob(Job.MarkFiles);
                    }).catch(function () {
                        _this.footerToolbar.removeJob(Job.MarkFiles);
                    })];
            });
        });
    };
    NewObjectsPage.prototype.handleActionResult = function (result) {
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
    NewObjectsPage.prototype.executeAction = function (action) {
        var _this = this;
        var hash = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then(function (result) {
            _this.handleActionResult(result);
            _this.footerToolbar.removeJob(hash);
        }).catch(function (error) {
            if (error instanceof CantOpenFileTypeException) {
                _this.showAlert(_this.translate.instant("actions.cant_open_file"));
                _this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(function (error) {
            if (error instanceof OfflineException) {
                _this.showAlert(_this.translate.instant("actions.offline_and_no_local_file"));
                _this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(function (error) {
            if (error instanceof RESTAPIException) {
                _this.showAlert(_this.translate.instant("actions.server_not_reachable"));
                _this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(function (message) {
            if (message) {
                Log.describe(_this, "action gone wrong: ", message);
            }
            _this.showAlert(_this.translate.instant("something_went_wrong"));
            _this.footerToolbar.removeJob(hash);
        });
    };
    NewObjectsPage.prototype.showAlert = function (message) {
        this.alert.create({
            header: message,
            buttons: [
                {
                    text: this.translate.instant("close"),
                    role: "cancel"
                }
            ]
        }).then(function (it) { return it.present(); });
    };
    NewObjectsPage.prototype.removeFromList = function (desktopItemRefId, item) {
        this.extractFromArray(item, this.allObjects);
        this.extractFromArray(item, this.objects[desktopItemRefId]);
    };
    NewObjectsPage.prototype.extractFromArray = function (item, list) {
        var index = "";
        for (var key in list) {
            var object = list[key];
            if (object.id == item.id) {
                index = key;
                break;
            }
        }
        if (index !== "") {
            Log.describe(this, "deleting key: ", index);
            Log.describe(this, "element was: ", list[index]);
            delete list[index];
        }
    };
    ;
    var NewObjectsPage_1;
    NewObjectsPage = NewObjectsPage_1 = __decorate([
        Component({
            templateUrl: "new-objects.html",
        }),
        __param(13, Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)),
        __param(14, Inject(LINK_BUILDER)),
        __metadata("design:paramtypes", [NavController,
            ActivatedRoute,
            ActionSheetController,
            LoadingController,
            FileService,
            SynchronizationService,
            AlertController,
            ToastController,
            FooterToolbarService,
            TranslateService,
            ModalController,
            DataProvider,
            InAppBrowser, Function, Object])
    ], NewObjectsPage);
    return NewObjectsPage;
}());
export { NewObjectsPage };
//# sourceMappingURL=new-objects.js.map