/** angular */
import {Component, Inject, ViewChild, NgZone} from "@angular/core";
import {
    ActionSheet,
    ActionSheetButton,
    ActionSheetController,
    ActionSheetOptions,
    AlertController,
    ModalController,
    NavController,
    NavParams,
    Refresher,
    Toast,
    ToastController
} from "ionic-angular";
/** ionic-native */
import {InAppBrowser} from "@ionic-native/in-app-browser/ngx";
/** services */
import {Builder} from "../../services/builder.base";
import {FileService} from "../../services/file.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {SynchronizationService} from "../../services/synchronization.service";
/** models */
import {DesktopItem} from "../../models/desktop-item";
import {ILIASObject} from "../../models/ilias-object";
import {PageLayout} from "../../models/page-layout";
import {TimeLine} from "../../models/timeline";
import {User} from "../../models/user";
import {Favorites} from "../../models/favorites";
/** actions */
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {MarkAsFavoriteAction} from "../../actions/mark-as-favorite-action";
import {ILIASObjectAction, ILIASObjectActionResult, ILIASObjectActionSuccess} from "../../actions/object-action";
import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceActionFunction} from "../../actions/open-learnplace-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {RemoveLocalFileAction} from "../../actions/remove-local-file-action";
import {RemoveLocalFilesAction} from "../../actions/remove-local-files-action";
import {REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION, RemoveLocalLearnplaceActionFunction} from "../../actions/remove-local-learnplace-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {SynchronizeAction} from "../../actions/synchronize-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
/** logging */
import {Log} from "../../services/log.service";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {Exception} from "../../exceptions/Exception";
import {DataProvider} from "../../providers/data-provider.provider";

/**
 * Summary of the state of an object-list-page
 */
interface PageState {
    favorites: boolean,
    online: boolean,
    loadingLive: boolean,
    loadingOffline: boolean,
    refreshing: boolean,
    desktop: boolean,
}
@Component({
    selector: "page-desktop",
    templateUrl: "object-list.html",
})
export class ObjectListPage {
    @ViewChild(Refresher) refresher: Refresher;

    /**
     * Objects under the given parent object
     */
    objects: Array<ILIASObject> = [];

    /**
     * The parent container object that was clicked to display the current objects
     */
    parent: ILIASObject;
    pageTitle: string;
    user: User;
    private state: PageState = {
        favorites: undefined,
        online: undefined,
        loadingLive: false,
        loadingOffline: false,
        refreshing: false,
        desktop: undefined
    };

    private readonly log: Logger = Logging.getLogger(ObjectListPage.name);

    readonly pageLayout: PageLayout;
    readonly timeline: TimeLine;

    constructor(private readonly nav: NavController,
                private readonly params: NavParams,
                private readonly actionSheet: ActionSheetController,
                private readonly file: FileService,
                private readonly sync: SynchronizationService,
                private readonly modal: ModalController,
                private readonly alert: AlertController,
                private readonly toast: ToastController,
                private readonly translate: TranslateService,
                private readonly dataProvider: DataProvider,
                private readonly ngZone: NgZone,
                readonly footerToolbar: FooterToolbarService,
                private readonly browser: InAppBrowser,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                @Inject(OPEN_LEARNPLACE_ACTION_FACTORY)
                private readonly openLearnplaceActionFactory: OpenLearnplaceActionFunction,
                @Inject(REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION)
                private readonly removeLocalLearnplaceActionFactory: RemoveLocalLearnplaceActionFunction,
                @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
    ) {
        this.parent = params.get("parent");
        this.state.favorites = params.get("favorites");

        if (this.parent) {
            this.pageTitle = this.parent.title;
            this.pageLayout = new PageLayout(this.parent.type);
            this.timeline = new TimeLine(this.parent.type);
        } else {
            this.pageTitle = ""; // will be updated by the observer
            const key: string = (this.state.favorites) ? "favorites.title" : "object-list.title";
            translate.get(key).subscribe((lng) => this.pageTitle = lng);
            this.pageLayout = new PageLayout();
            this.timeline = new TimeLine();
        }
    }

    /**
     * load the content for the chosen ILIASObject
     */
    ionViewWillEnter(): void {
        this.ngZone.run(() => this.loadContent());
        this.log.trace(() => `Ion view will enter page object list. favorites is ${this.state.favorites}`);
    }

    /**
     * Loads the current User and updates this.user if the result is valid
     */
    async updateUser(): Promise<void> {
        const newUser: User = await User.currentUser();
        if (newUser !== undefined) this.user = newUser;
        if (this.user === undefined) console.warn("in the page object-list, this.user is undefined");
    }

    /**
     * Updates the state-object of the page
     */
    updatePageState(): void {
        this.state.favorites = this.params.get("favorites");
        this.state.online = window.navigator.onLine;
        this.state.loadingLive = SynchronizationService.state.liveLoading;
        this.state.loadingOffline = SynchronizationService.state.loadingOfflineContent;
        this.state.refreshing = this.refresher.state === "refreshing";
        this.state.desktop = this.parent === undefined;
    }

    /**
     * Checks whether the page is in a given state
     */
    checkPageState(state: Partial<PageState>): boolean {
        this.updatePageState();
        for(const p in state)
            if(state[p] !== this.state[p]) return false;
        return true;
    }

    /**
     * Opens the parent object in ILIAS.
     */
    openPageLayout(): void {
        this.checkParent();
        const action: ILIASObjectAction = this.openInIliasActionFactory(
            this.translate.instant("actions.view_in_ilias"),
            this.linkBuilder.default().target(this.parent.refId)
        );
        this.executeAction(action);
    }

    /**
     * Opens the timeline of the parent object in ILIAS.
     */
    openTimeline(): void {
        this.checkParent();
        const action: ILIASObjectAction = this.openInIliasActionFactory(
            this.translate.instant("actions.view_in_ilias"),
            this.linkBuilder.timeline().target(this.parent.refId)
        );
        this.executeAction(action);
    }

    /**
     * Switches to Favourites-tab
     */
    protected switchToFavoritesTab(): void {
        this.nav.parent.select(3);
    }

    /**
     * Checks the parent on null
     * @throws Exception if the parent is null
     */
    private checkParent(): void {
        if (this.parent == undefined) {
            throw new Exception("Can not open link for undefined. Do not call this method on ILIAS objects with no parent.");
        }
    }

    /**
     * called by pull-to-refresh refresher
     * @returns {Promise<void>}
     */
    async loadContent(): Promise<void> {
        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
        this.updatePageState();

        if(this.state.favorites) {
            if (this.state.online && this.state.refreshing) await this.sync.loadAllOfflineContent();
            await this.loadFavoritesObjectList();
        } else {
            if (this.state.online) await this.liveLoadContent();
            await this.loadCachedObjects(this.parent === undefined);
        }

        this.refresher.complete();
        this.footerToolbar.removeJob(Job.Synchronize);
        this.updatePageState();
    }

    /**
     * loads available content without synchronization and user-feedback
     * @returns {Promise<void>}
     */
    async refreshContent(): Promise<void> {
        if(this.state.favorites) await this.loadFavoritesObjectList();
        else await this.loadCachedObjects(this.parent === undefined);
        this.updatePageState();
    }

    /**
     * live-load content from account
     * @returns {Promise<void>}
     */
    async liveLoadContent(): Promise<void> {
        try {
            Log.write(this, "Sync start", [], []);
            await this.sync.liveLoad(this.parent);
        } catch (error) {
            Log.error(this, error);
            throw error;
        }
    }

    /**
     * load content from favorites
     * @returns {Promise<void>}
     */
    async loadFavoritesObjectList(): Promise<void> {
        if(this.parent === undefined) {
            await this.updateUser();
            Favorites.findByUserId(this.user.id)
                .then(favorites => {
                    favorites.sort(ILIASObject.compare);
                    this.objects = favorites;
                });
        }
        else await this.loadCachedObjects(false);
    }

    /**
     * Loads the object data from db cache.
     * @returns {Promise<void>}
     */
    private async loadCachedObjects(isDesktopObject: boolean): Promise<void> {
        try {
            await this.updateUser();
            this.objects = (isDesktopObject) ?
                await DesktopItem.findByUserId(this.user.id) :
                await ILIASObject.findByParentRefId(this.parent.refId, this.user.id);

            this.objects.sort(ILIASObject.compare);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    onClick(iliasObject: ILIASObject): void {
        const primaryAction: ILIASObjectAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);
        // When executing the primary action, we reset the isNew state
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    }

    /**
     * Returns the primary action for the given object
     * @param iliasObject
     * @returns {ILIASObjectAction}
     */
    protected getPrimaryAction(iliasObject: ILIASObject): ILIASObjectAction {

        if (iliasObject.isLinked()) {
            return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
        }

        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.nav, this.params);
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

    executeAction(action: ILIASObjectAction): void {
        //const hash: number = action.instanceId();
        //this.footerToolbar.addJob(hash, "");
        action.execute().then((result) => {
            this.handleActionResult(result);
            //this.footerToolbar.removeJob(hash);
        }).catch((error) => {

            this.log.warn(() => `Could not execute action: action=${action.constructor.name}, error=${JSON.stringify(error)}`);
            //this.footerToolbar.removeJob(hash);
            throw error;
        }).then(() => this.refreshContent());
    }

    executeSetFavoriteValueAction(iliasObject: ILIASObject, value: boolean): void {
        this.updatePageState();
        if(!this.state.online) return;

        const actions: Array<ILIASObjectAction> = [];
        if(value) this.applyMarkAsFavoriteAction(actions, iliasObject);
        else this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.executeAction(actions.pop());
    }

    private handleActionResult(result: ILIASObjectActionResult): void {
        if (!result) return;
        if (result instanceof ILIASObjectActionSuccess) {
            if (result.message) {
                const toast: Toast = this.toast.create({
                    message: result.message,
                    duration: 3000
                });
                toast.present();
            }
        }
    }

    /**
     * Show the action sheet for the given object
     * @param iliasObject
     */
    showActions(iliasObject: ILIASObject): void {
        this.updatePageState();
        const actions: Array<ILIASObjectAction> = [];

        this.applyDefaultActions(actions, iliasObject);
        this.applyMarkAsFavoriteAction(actions, iliasObject);
        this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.applySynchronizeAction(actions, iliasObject);
        this.applyRemoveLocalFileAction(actions, iliasObject);
        this.applyRemoveLearnplaceAction(actions, iliasObject);

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
        actionSheet.present();
    }

    private applyDefaultActions(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        actions.push(new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav));
        if (this.state.online) actions.push(
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId))
        );
    }

    private applyMarkAsFavoriteAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(!iliasObject.isFavorite && this.state.online) {
            actions.push(new MarkAsFavoriteAction(
                this.translate.instant("actions.mark_as_favorite"),
                iliasObject,
                this.sync
            ));
        }
    }

    private applyUnmarkAsFavoriteAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(
                this.translate.instant("actions.unmark_as_favorite"),
                iliasObject,
                this.file
            ));
        }
    }

    private applySynchronizeAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isOfflineAvailable  && this.state.online && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM
            && (
                iliasObject.isContainer() && !iliasObject.isLinked() && !iliasObject.isLearnplace()
                ||
                iliasObject.isFile()
            )
        ) {
            actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
        }
    }

    private applyRemoveLocalFileAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isContainer() && !iliasObject.isLinked() && !iliasObject.isLearnplace()) {
            actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), iliasObject, this.file, this.translate));
        }

        if(iliasObject.isFile())
            actions.push(new RemoveLocalFileAction(this.translate.instant("actions.remove_local_file"), iliasObject, this.file, this.translate));

    }

    private applyRemoveLearnplaceAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isLearnplace())
            actions.push(this.removeLocalLearnplaceActionFactory(
                this.translate.instant("actions.remove_local_learnplace"), iliasObject.objId, iliasObject.userId)
            );
    }
}
