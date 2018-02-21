import {Component, Inject} from "@angular/core";
import {NavController, ActionSheetController, Alert, Toast, ToastOptions,
  ActionSheet, ActionSheetOptions, ActionSheetButton, AlertController, ToastController} from "ionic-angular";
import {ILIASObject} from "../../models/ilias-object";
import {Favorites} from "../../models/favorites";
import {FileService} from "../../services/file.service";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {ILIASObjectAction, ILIASObjectActionResult, ILIASObjectActionSuccess} from "../../actions/object-action";
import { TranslateService } from "ng2-translate/src/translate.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {User} from "../../models/user";
import {Log} from "../../services/log.service";
import {CantOpenFileTypeException} from "../../exceptions/CantOpenFileTypeException";
import {OfflineException} from "../../exceptions/OfflineException";
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {RESTAPIException} from "../../exceptions/RESTAPIException";
import {TokenUrlConverter} from "../../services/url-converter.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {Builder} from "../../services/builder.base";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";


@Component({
    templateUrl: "favorites.html"
})
export class FavoritesPage {

    private favorites: Array<ILIASObject> = [];

    private actionSheetActive: boolean = false;

    private rootParents: Array<Promise<string>> = [];

    constructor(public nav: NavController,
                public file: FileService,
                public actionSheet: ActionSheetController,
                public translate: TranslateService,
                public footerToolbar: FooterToolbarService,
                public alert: AlertController,
                public toast: ToastController,
                private readonly urlConverter: TokenUrlConverter,
                private readonly browser: InAppBrowser,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
    ) {}

    ionViewDidLoad(): void {
        this.loadFavorites();
    }

    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    onClick(iliasObject: ILIASObject): void {
        if (this.actionSheetActive) return;
        // let primaryAction = this.objectActions.getPrimaryAction(iliasObject);
        const primaryAction: ILIASObjectAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);
        // When executing the primary action, we reset the isNew state
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    }

    executeAction(action: ILIASObjectAction): void {
        const hash: number = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then((result) => {
            this.handleActionResult(result);
            this.footerToolbar.removeJob(hash);
        }).catch((error: CantOpenFileTypeException) => {
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

    private showAlert(message: string): void {
        const alert: Alert = this.alert.create({
            title: message,
            buttons: [
                {
                    text: this.translate.instant("close"),
                    role: "cancel"
                }
                ]
        });
        alert.present();
    }

    private handleActionResult(result: ILIASObjectActionResult): void {
        this.loadFavorites();
        if (!result) return;
        if (result instanceof ILIASObjectActionSuccess) {
            if (result.message) {
                const toast: Toast = this.toast.create(<ToastOptions>{
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
    showActions(object: ILIASObject): void {
        this.actionSheetActive = true;
        const actionButtons: Array<ActionSheetButton> = [];
        // let actions = this.objectActions.getActions(object, ILIASObjectActionsService.CONTEXT_ACTION_MENU);
        const actions: Array<ILIASObjectAction> = [
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), object, this.nav),
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(object.refId)),
            new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), object)
        ];
        actions.forEach(action => {
            actionButtons.push({
                text: action.title,
                handler: (): void => {
                    this.executeAction(action);
                    this.actionSheetActive = false;
                }
            });
        });
        actionButtons.push({
            text: this.translate.instant("cancel"),
            handler: (): void => {
                this.actionSheetActive = false;
            }
        });
        const actionSheet: ActionSheet = this.actionSheet.create(<ActionSheetOptions>{
            "title": object.title,
            "buttons": actionButtons
        });
        actionSheet.onDidDismiss(() => {
            this.actionSheetActive = false;
        });
        actionSheet.present();
    }

    protected getPrimaryAction(iliasObject: ILIASObject): ILIASObjectAction {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.nav);
        }
        if (iliasObject.type == "file") {
            return new DownloadAndOpenFileExternalAction(
              this.translate.instant("actions.download_and_open_in_external_app"),
              iliasObject,
              this.file,
              this.translate,
              this.alert
            );
        }
        return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
    }

    protected loadFavorites(): void {
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
