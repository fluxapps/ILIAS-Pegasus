import {Component, Inject} from "@angular/core";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {
    ActionSheet,
    ActionSheetButton,
    ActionSheetController,
    ActionSheetOptions,
    Alert,
    AlertController,
    AlertOptions,
    Events,
    Modal,
    ModalController,
    NavController,
    NavParams,
    Refresher,
    Toast,
    ToastController
} from "ionic-angular";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {TranslateService} from "ng2-translate/src/translate.service";
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {MarkAsFavoriteAction} from "../../actions/mark-as-favorite-action";
import {MarkAsOfflineAvailableAction} from "../../actions/mark-as-offline-available-action";
import {ILIASObjectAction, ILIASObjectActionResult, ILIASObjectActionSuccess} from "../../actions/object-action";
import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceActionFunction} from "../../actions/open-learnplace-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {RemoveLocalFileAction} from "../../actions/remove-local-file-action";
import {RemoveLocalFilesAction} from "../../actions/remove-local-files-action";
import {
    REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION, RemoveLocalLearnplaceAction,
    RemoveLocalLearnplaceActionFunction
} from "../../actions/remove-local-learnplace-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {SynchronizeAction} from "../../actions/synchronize-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {UnMarkAsOfflineAvailableAction} from "../../actions/unmark-as-offline-available-action";
import {Exception} from "../../exceptions/Exception";
import {DesktopItem} from "../../models/desktop-item";
import {ILIASObject} from "../../models/ilias-object";
import {PageLayout} from "../../models/page-layout";
import {TimeLine} from "../../models/timeline";
import {User} from "../../models/user";
import {DataProvider} from "../../providers/data-provider.provider";
import {Builder} from "../../services/builder.base";
import {FileService} from "../../services/file.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {Log} from "../../services/log.service";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {SynchronizationService, SyncResults} from "../../services/synchronization.service";
import {SynchronizationPage} from "../../app/fallback/synchronization/synchronization.component";
import {SyncFinishedModal} from "../sync-finished-modal/sync-finished-modal";
import {BrandingProvider} from "../../providers/branding";

@Component({
    templateUrl: "object-list.html",
})
export class ObjectListPage {

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
    actionSheetActive: boolean = false;

    private readonly log: Logger = Logging.getLogger(ObjectListPage.name);

    readonly pageLayout: PageLayout;
    readonly timeline: TimeLine;

    constructor(private readonly nav: NavController,
                params: NavParams,
                private readonly actionSheet: ActionSheetController,
                private readonly file: FileService,
                private readonly sync: SynchronizationService,
                private readonly modal: ModalController,
                private readonly alert: AlertController,
                private readonly toast: ToastController,
                private readonly translate: TranslateService,
                private readonly dataProvider: DataProvider,
                readonly footerToolbar: FooterToolbarService,
                private readonly events: Events,
                private readonly browser: InAppBrowser,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                @Inject(OPEN_LEARNPLACE_ACTION_FACTORY)
                private readonly openLearnplaceActionFactory: OpenLearnplaceActionFunction,
                @Inject(REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION)
                private readonly removeLocalLearnplaceActionFactory: RemoveLocalLearnplaceActionFunction,
                @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
                private readonly theme: BrandingProvider
    ) {
        this.parent = params.get("parent");

        if (this.parent) {
            this.pageTitle = this.parent.title;
            this.pageLayout = new PageLayout(this.parent.type);
            this.timeline = new TimeLine(this.parent.type);
        } else {
            this.pageTitle = ""; // will be updated by the observer
            this.pageLayout = new PageLayout();
            this.timeline = new TimeLine();
            translate.get("object-list.title").subscribe((lng) => {
                this.pageTitle = lng;
            });
        }
        this.initEventListeners();
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
     * Checks the parent on null.
     *
     * @throws Exception if the parent is null
     */
    private checkParent(): void {
        if (this.parent == undefined) {
            throw new Exception("Can not open link for undefined. Do not call this method on ILIAS objects with no parent.");
        }
    }

    ionViewDidEnter(): void {
        this.log.trace(() => "Ion view did enter.");
        this.calculateChildrenMarkedAsNew();
    }

    ionViewDidLoad(): void {
        this.log.trace(() => "Ion view did load page object list.");

        User.currentUser()
            .then(user => {
                this.user = user;

                return this.loadCachedObjects();
            })
            .then(() => {

                if (this.objects.length == 0 && this.parent == undefined) {
                    this.executeSync();
                }
            });
    }

    private async loadCachedObjects(): Promise<void> {

        this.user = await User.currentUser();

        if (this.parent == undefined) {
            await this.loadCachedDesktopData();
        } else {
            await this.loadCachedObjectData();
        }

        return Promise.resolve();
    }

    /**
     * Loads the object data from db cache.
     * @returns {Promise<void>}
     */
    private async loadCachedObjectData(): Promise<void> {

        try {

            this.footerToolbar.addJob(this.parent.refId, "");

            this.objects = await ILIASObject.findByParentRefId(this.parent.refId, this.user.id);
            this.objects.sort(ILIASObject.compare);
            this.calculateChildrenMarkedAsNew();

            this.footerToolbar.removeJob(this.parent.refId);

            return Promise.resolve();

        } catch (error) {
            this.footerToolbar.removeJob(this.parent.refId);
            return Promise.reject(error);
        }
    }

    /**
     * load the desktop data from the local db.
     * @returns {Promise<void>}
     */
    private async loadCachedDesktopData(): Promise<void> {

        try {

            this.footerToolbar.addJob(Job.DesktopAction, "");

            this.objects = await DesktopItem.findByUserId(this.user.id);
            this.objects.sort(ILIASObject.compare);
            this.calculateChildrenMarkedAsNew();

            this.footerToolbar.removeJob(Job.DesktopAction);

            return Promise.resolve();

        } catch (error) {
            this.footerToolbar.removeJob(Job.DesktopAction);
            return Promise.reject(error);
        }
    }

    // TODO: Refactor method to make sure it returns a Promise<void>
    private calculateChildrenMarkedAsNew(): void {
        // Container objects marked as offline available display the number of new children as badge
        this.objects.forEach(iliasObject => {
            if (iliasObject.isContainer()) {
                ILIASObject.findByParentRefIdRecursive(iliasObject.refId, iliasObject.userId).then(iliasObjects => {
                    const newObjects: Array<ILIASObject> = iliasObjects.filter((iliasObject: ILIASObject) => {
                        return iliasObject.isNew || iliasObject.isUpdated;
                    });
                    const n: number = newObjects.length;
                    Log.describe(this, "Object:", iliasObject);
                    Log.describe(this, "Objects marked as new: ", n);
                    iliasObject.newSubItems = n;
                });
            } else {
                iliasObject.newSubItems = 0;
            }
        });
    }


    /**
     * called by pull-to-refresh refresher
     *
     * @param {Refresher} refresher
     * @returns {Promise<void>}
     */
    async startSync(refresher: Refresher): Promise<void> {
        refresher.complete();
        await this.executeSync();
    }

    /**
     * executes global sync
     *
     * @returns {Promise<void>}
     */
    private async executeSync(): Promise<void> {

        try {

            if (this.sync.isRunning) {
                this.log.debug(() => "Unable to sync because sync is already running.");
                return;
            }
            const syncModal: Modal = this.displaySyncScreen();
            Log.write(this, "Sync start", [], []);
            this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));

            const syncResult: SyncResults = await this.sync.execute();
            this.calculateChildrenMarkedAsNew();

            // We have some files that were marked but not downloaded. We need to explain why and open a modal.
            if (syncResult.objectsLeftOut.length > 0) {
                const syncModal: Modal = this.modal.create(SyncFinishedModal, {syncResult: syncResult});
                await syncModal.present();
            }

            //maybe some objects came in new.
            this.footerToolbar.removeJob(Job.Synchronize);
            this.hideSyncScreen(syncModal);

        } catch (error) {

            Log.error(this, error);
            this.footerToolbar.removeJob(Job.Synchronize);
            throw error;
        }
    }

    private displayAlert(title: string, message: string): void {
        const alert: Alert = this.alert.create(<AlertOptions>{
            title: title,
            message: message,
            buttons: [
                <AlertButton>{
                    text: "Ok"
                }
            ]
        });
        alert.present();
    }

    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    onClick(iliasObject: ILIASObject): void {
        if (this.actionSheetActive) return;
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

    /**
     * Show the action sheet for the given object
     * @param iliasObject
     */
    showActions(iliasObject: ILIASObject): void {
        this.actionSheetActive = true;

        const actions: Array<ILIASObjectAction> = [];

        this.applyDefaultActions(actions, iliasObject);
        this.applyMarkAsFavoriteAction(actions, iliasObject);
        this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.applyMarkAsOfflineAction(actions, iliasObject);
        this.applyUnmarkAsOfflineAction(actions, iliasObject);
        this.applySynchronizeAction(actions, iliasObject);
        this.applyRemoveLocalFileAction(actions, iliasObject);
        this.applyRemoveLearnplaceAction(actions, iliasObject);

        const buttons: Array<ActionSheetButton> = actions.map(action => {

            return <ActionSheetButton>{
                text: action.title,
                handler: (): void => {
                    this.actionSheetActive = false;
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
                this.actionSheetActive = false;
            }
        });

        const options: ActionSheetOptions = {
            title: iliasObject.title,
            buttons: buttons
        };
        const actionSheet: ActionSheet = this.actionSheet.create(options);
        actionSheet.onDidDismiss(() => {
            this.actionSheetActive = false;
        });
        actionSheet.present();
    }

    private applyDefaultActions(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        actions.push(
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav),
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId))
        );
    }

    private applyMarkAsFavoriteAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(!iliasObject.isFavorite) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject));
        }
    }

    private applyUnmarkAsFavoriteAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject));
        }
    }

    private applyMarkAsOfflineAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(!iliasObject.isOfflineAvailable
            && (
                iliasObject.isContainer() && !iliasObject.isLinked()
                ||
                iliasObject.isFile()
                ||
                iliasObject.isLearnplace()
            )
        ) {
            actions.push(new MarkAsOfflineAvailableAction(
                this.translate.instant("actions.mark_as_offline_available"),
                iliasObject,
                this.dataProvider,
                this.sync,
                this.modal)
            );
        }
    }

    private applyUnmarkAsOfflineAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM
            && (
                iliasObject.isContainer() && !iliasObject.isLinked()
                ||
                iliasObject.isFile()
                ||
                iliasObject.isLearnplace()
            )
        ) {
            actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"), iliasObject));
        }
    }

    private applySynchronizeAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM
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

    initEventListeners(): void {
        // We want to refresh after a synchronization.
        this.events.subscribe("sync:complete", () => {
            this.loadCachedObjects();
        });
    }

    executeAction(action: ILIASObjectAction): void {
        const hash: number = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then((result) => {
            this.handleActionResult(result);
            this.calculateChildrenMarkedAsNew();
            this.footerToolbar.removeJob(hash);
        }).catch((error) => {

            this.log.warn(() => `Could not execute action: action=${action.constructor.name}, error=${JSON.stringify(error)}`);
            this.footerToolbar.removeJob(hash);
            throw error;
        });
    }

    displaySyncScreen(): Modal {
        if(this.objects.length)
            return undefined;

        const syncModal: Modal = this.modal.create(SynchronizationPage, {}, {enableBackdropDismiss: false});
        syncModal.present();
        return syncModal;
    }

    hideSyncScreen(syncModal: Modal): void {
        if(syncModal)
            syncModal.dismiss();
    }
}
