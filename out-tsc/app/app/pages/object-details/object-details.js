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
/** angular */
import { Component, Inject } from "@angular/core";
import { AlertController, ModalController, NavController, NavParams, ToastController } from "@ionic/angular";
/** ionic-native */
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { FileService } from "../../services/file.service";
import { FooterToolbarService } from "../../services/footer-toolbar.service";
import { LINK_BUILDER } from "../../services/link/link-builder.service";
import { SynchronizationService } from "../../services/synchronization.service";
/** actions */
import { MarkAsFavoriteAction } from "../../actions/mark-as-favorite-action";
import { ILIASObjectActionSuccess } from "../../actions/object-action";
import { OpenFileExternalAction } from "../../actions/open-file-external-action";
import { OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY } from "../../actions/open-object-in-ilias-action";
import { RemoveLocalFileAction } from "../../actions/remove-local-file-action";
import { RemoveLocalFilesAction } from "../../actions/remove-local-files-action";
import { SynchronizeAction } from "../../actions/synchronize-action";
import { UnMarkAsFavoriteAction } from "../../actions/unmark-as-favorite-action";
/** logging */
import { Log } from "../../services/log.service";
import { Logging } from "../../services/logging/logging.service";
/** misc */
import { ILIASObject } from "../../models/ilias-object";
import { DataProvider } from "../../providers/data-provider.provider";
import { TranslateService } from "@ngx-translate/core";
var ObjectDetailsPage = /** @class */ (function () {
    function ObjectDetailsPage(nav, dataProvider, sync, file, alert, toast, translate, footerToolbar, modal, browser, openInIliasActionFactory, linkBuilder, params) {
        this.nav = nav;
        this.dataProvider = dataProvider;
        this.sync = sync;
        this.file = file;
        this.alert = alert;
        this.toast = toast;
        this.translate = translate;
        this.footerToolbar = footerToolbar;
        this.modal = modal;
        this.browser = browser;
        this.openInIliasActionFactory = openInIliasActionFactory;
        this.linkBuilder = linkBuilder;
        this.log = Logging.getLogger(ObjectDetailsPage_1.name);
        this.iliasObject = params.get("object");
        Log.describe(this, "Showing details of: ", this.iliasObject);
    }
    ObjectDetailsPage_1 = ObjectDetailsPage;
    ObjectDetailsPage.prototype.ionViewDidLoad = function () {
        this.loadAvailableActions();
        this.loadObjectDetails();
    };
    ObjectDetailsPage.prototype.executeAction = function (action) {
        var _this = this;
        if (action.alert()) {
            this.alert.create({
                header: action.alert().title,
                message: action.alert().subTitle,
                buttons: [
                    {
                        text: "Cancel",
                        role: "cancel",
                        handler: function () {
                            // alert.dismiss();
                        }
                    },
                    {
                        text: "Ok",
                        handler: function () {
                            _this.executeAndHandleAction(action);
                        }
                    }
                ]
            }).then(function (it) { return it.present(); });
        }
        else {
            this.executeAndHandleAction(action);
        }
    };
    ObjectDetailsPage.prototype.executeAndHandleAction = function (action) {
        var _this = this;
        this.log.trace(function () { return "executeAndHandleAction"; });
        this.log.debug(function () { return "action: " + action; });
        action.execute()
            .then(function (result) { return _this.actionHandler(result); })
            .catch(function (error) {
            _this.log.warn(function () { return "action gone wrong: " + error; });
            _this.loadAvailableActions();
            _this.loadObjectDetails();
            throw error;
        });
    };
    ObjectDetailsPage.prototype.actionHandler = function (result) {
        Log.write(this, "actionHandler");
        this.handleActionResult(result);
        this.loadAvailableActions();
        this.loadObjectDetails();
    };
    ObjectDetailsPage.prototype.handleActionResult = function (result) {
        Log.write(this, "handleActionResult");
        if (!result)
            return;
        if (result instanceof ILIASObjectActionSuccess) {
            if (result.message) {
                this.toast.create({
                    message: result.message,
                    duration: 3000
                }).then(function (it) { return it.present; });
            }
        }
    };
    ObjectDetailsPage.prototype.loadObjectDetails = function () {
        var _this = this;
        this.iliasObject.presenter.details().then(function (details) {
            Log.describe(_this, "Details are displayed: ", details);
            _this.details = details;
        });
    };
    ObjectDetailsPage.prototype.loadAvailableActions = function () {
        var _this = this;
        this.actions = [
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(this.iliasObject.refId))
        ];
        if (this.iliasObject.isContainer() && !this.iliasObject.isLinked()) {
            if (!this.iliasObject.isFavorite) {
                this.actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), this.iliasObject, this.sync));
            }
            else if (this.iliasObject.isFavorite && this.iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                this.actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), this.iliasObject, this.file));
                this.actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), this.iliasObject, this.sync, this.modal, this.translate));
            }
            this.actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), this.iliasObject, this.file, this.translate));
        }
        if (this.iliasObject.type == "file") {
            this.file.existsFile(this.iliasObject).then(function () {
                _this.actions.push(new OpenFileExternalAction(_this.translate.instant("actions.open_in_external_app"), _this.iliasObject, _this.file));
                _this.actions.push(new RemoveLocalFileAction(_this.translate.instant("actions.remove_local_file"), _this.iliasObject, _this.file, _this.translate));
            }, function () {
                Log.write(_this, "No file available: Remove and Open are not available.");
            });
            if (!this.iliasObject.isFavorite) {
                this.actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), this.iliasObject, this.sync));
            }
            else if (this.iliasObject.isFavorite && this.iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                this.actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), this.iliasObject, this.file));
            }
        }
    };
    var ObjectDetailsPage_1;
    ObjectDetailsPage = ObjectDetailsPage_1 = __decorate([
        Component({
            templateUrl: "object-details.html"
        }),
        __param(10, Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)),
        __param(11, Inject(LINK_BUILDER)),
        __metadata("design:paramtypes", [NavController,
            DataProvider,
            SynchronizationService,
            FileService,
            AlertController,
            ToastController,
            TranslateService,
            FooterToolbarService,
            ModalController,
            InAppBrowser, Function, Object, NavParams])
    ], ObjectDetailsPage);
    return ObjectDetailsPage;
}());
export { ObjectDetailsPage };
//# sourceMappingURL=object-details.js.map