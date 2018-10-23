import {Component, Inject} from "@angular/core";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {
    ActionSheet,
    ActionSheetButton,
    ActionSheetController,
    ActionSheetOptions,
    AlertController,
    NavController,
    Toast,
    ToastController,
    ToastOptions,
    ModalController,
} from "ionic-angular";
import {TranslateService} from "ng2-translate/src/translate.service";
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {ILIASObjectAction, ILIASObjectActionResult, ILIASObjectActionSuccess} from "../../actions/object-action";
import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceActionFunction} from "../../actions/open-learnplace-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION, RemoveLocalLearnplaceActionFunction} from "../../actions/remove-local-learnplace-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {Favorites} from "../../models/favorites";
import {ILIASObject} from "../../models/ilias-object";
import {User} from "../../models/user";
import {Builder} from "../../services/builder.base";
import {FileService} from "../../services/file.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {Log} from "../../services/log.service";
import {ThemeProvider} from "../../providers/theme";


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
                private modal: ModalController,
                private readonly browser: InAppBrowser,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                @Inject(OPEN_LEARNPLACE_ACTION_FACTORY)
                private readonly openLearnplaceActionFactory: OpenLearnplaceActionFunction,
                @Inject(REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION)
                private readonly removeLocalLearnplaceActionFactory: RemoveLocalLearnplaceActionFunction,
                @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
                private readonly theme: ThemeProvider
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
        }).catch((error) => {
            Log.describe(this, "action gone wrong: ", error);
            this.footerToolbar.removeJob(hash);
            throw error;
        });
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
      if (iliasObject.isLinked()) {
        return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
      }

      if (iliasObject.isContainer()) {
        return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.nav);
      }

      if (iliasObject.isLearnplace()) {
        return this.openLearnplaceActionFactory(this.nav, iliasObject.objId, iliasObject.title, this.modal);
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
