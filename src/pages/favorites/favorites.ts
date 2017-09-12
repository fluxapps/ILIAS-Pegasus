import {Component} from '@angular/core';
import {NavController, ActionSheetController} from 'ionic-angular';
import {ILIASObject} from "../../models/ilias-object";
import {Favorites} from "../../models/favorites";
import {FileService} from "../../services/file.service";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {ILIASObjectAction} from "../../actions/object-action";
import { TranslateService } from "ng2-translate/src/translate.service";
import {FooterToolbarService} from "../../services/footer-toolbar.service";
import {User} from "../../models/user";
import {ILIASObjectActionSuccess} from "../../actions/object-action";
import {AlertController} from "ionic-angular/index";
import {ToastController} from "ionic-angular/index";
import {Job} from "../../services/footer-toolbar.service";
import {Log} from "../../services/log.service";
import {CantOpenFileTypeException} from "../../exceptions/CantOpenFileTypeException";
import {OfflineException} from "../../exceptions/OfflineException";
import {RESTAPITimeoutException} from "../../exceptions/RESTAPITimeoutException";
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {RESTAPIException} from "../../exceptions/RESTAPIException";
import {ILIASLink, TokenUrlConverter} from "../../services/url-converter.service";



@Component({
    templateUrl: 'favorites.html'
})
export class FavoritesPage {

    public favorites:ILIASObject[] = null;

    public actionSheetActive = false;

    public rootParents = [];

    constructor(public nav:NavController,
                public file:FileService,
                public actionSheet:ActionSheetController,
                public translate:TranslateService,
                public footerToolbar:FooterToolbarService,
                public alert:AlertController,
                public toast:ToastController,
                private readonly urlConverter: TokenUrlConverter) {
    }

    public ionViewDidLoad() {
        this.loadFavorites();
    }

    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    public onClick(iliasObject:ILIASObject) {
        if (this.actionSheetActive) return;
        // let primaryAction = this.objectActions.getPrimaryAction(iliasObject);
        let primaryAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);
        // When executing the primary action, we reset the isNew state
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    }

    public executeAction(action:ILIASObjectAction):void {
        let hash = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then((result) => {
            this.handleActionResult(result);
            this.footerToolbar.removeJob(hash);
        }).catch((error:CantOpenFileTypeException) => {
            if(error instanceof CantOpenFileTypeException) {
                this.showAlert(this.translate.instant("actions.cant_open_file"));
                this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(error => {
            if(error instanceof OfflineException) {
                this.showAlert(this.translate.instant("actions.offline_and_no_local_file"));
                this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(error => {
            if(error instanceof RESTAPIException) {
                this.showAlert(this.translate.instant("actions.server_not_reachable"));
                this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);

        }).catch((message) => {
            if (message) {
                Log.describe(this, "action gone wrong: ", message);
            }
            this.showAlert(this.translate.instant("something_went_wrong"));
            this.footerToolbar.removeJob(hash);
        });
    }

    protected showAlert(message) {
        let alert = this.alert.create({
            title: message,
            buttons: [
                {
                    text: this.translate.instant("close"),
                    role: 'cancel'
                }
                ]
        });
        alert.present();
    }

    protected handleActionResult(result) {
        this.loadFavorites();
        if (!result) return;
        if (result instanceof ILIASObjectActionSuccess) {
            if (result.message) {
                let toast = this.toast.create({
                    message: result.message,
                    duration: 3000
                });
                toast.present();
            }
        }
    }

    /**
     * Show action sheet for the given object
     * @param object
     */
    public showActions(object:ILIASObject) {
        this.actionSheetActive = true;
        let actionButtons = [];
        // let actions = this.objectActions.getActions(object, ILIASObjectActionsService.CONTEXT_ACTION_MENU);
        let actions:ILIASObjectAction[] = [
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), object, this.nav),
            new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), new ILIASLink(object.link), this.urlConverter),
            new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), object)
        ];
        actions.forEach(action => {
            actionButtons.push({
                text: action.title,
                handler: () => {
                    this.executeAction(action);
                    this.actionSheetActive = false;
                }
            });
        });
        actionButtons.push({
            text: this.translate.instant("cancel"),
            handler: () => {
                this.actionSheetActive = false;
            }
        });
        let actionSheet = this.actionSheet.create({
            'title': object.title,
            'buttons': actionButtons
        });
        actionSheet.onDidDismiss(() => {
            this.actionSheetActive = false;
        });
        actionSheet.present();
    }

    protected getPrimaryAction(iliasObject:ILIASObject):ILIASObjectAction {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.nav);
        }
        if (iliasObject.type == 'file') {
            return new DownloadAndOpenFileExternalAction(this.translate.instant("actions.download_and_open_in_external_app"), iliasObject, this.file, this.translate, this.alert);
        }
        return new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), new ILIASLink(iliasObject.link), this.urlConverter);
    }

    protected loadFavorites() {
        this.footerToolbar.addJob(Job.LoadFavorites, "");
        User.currentUser().then((user) => {
            Favorites.findByUserId(user.id).then(favorites => {
                favorites.sort(ILIASObject.compare);
                this.favorites = favorites;
                favorites.forEach(favorite => {
                    this.rootParents[favorite.id] = favorite.rootParent;
                });
                this.footerToolbar.removeJob(Job.LoadFavorites);
            });
        });
    }

}
