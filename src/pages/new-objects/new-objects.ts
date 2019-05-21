import {Component, Inject} from "@angular/core";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {
    ActionSheet,
    ActionSheetButton,
    ActionSheetController,
    Alert,
    AlertController,
    LoadingController,
    ModalController,
    NavController,
    NavParams,
    Toast,
    ToastController
} from "ionic-angular";
import {TranslateService} from "ng2-translate/src/translate.service";
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {MarkAsFavoriteAction} from "../../actions/mark-as-favorite-action";
import {ILIASObjectAction, ILIASObjectActionResult, ILIASObjectActionSuccess} from "../../actions/object-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {RemoveLocalFilesAction} from "../../actions/remove-local-files-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {SynchronizeAction} from "../../actions/synchronize-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {CantOpenFileTypeException} from "../../exceptions/CantOpenFileTypeException";
import {OfflineException} from "../../exceptions/OfflineException";
import {RESTAPIException} from "../../exceptions/RESTAPIException";
import {ActiveRecord} from "../../models/active-record";
import {DesktopItem} from "../../models/desktop-item";
import {ILIASObject} from "../../models/ilias-object";
import {User} from "../../models/user";
import {DataProvider} from "../../providers/data-provider.provider";
import {Builder} from "../../services/builder.base";
import {FileService} from "../../services/file.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {Log} from "../../services/log.service";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {SynchronizationService} from "../../services/synchronization.service";
import {LoginPage} from "../login/login";


@Component({
    templateUrl: "new-objects.html",
})
export class NewObjectsPage {

    private readonly log: Logger = Logging.getLogger(NewObjectsPage.name);

    /**
     * Objects under the given parent object
     */
    objects: {[containerId: number]: Array<ILIASObject>} = {};

    /**
     * The parent container object that was clicked to display the current objects
     */
    parent: ILIASObject;
    pageTitle: string;
    user: User;
    actionSheetActive: boolean = false;
    desktopItems: Array<ILIASObject> = [];
    allObjects: Array<ILIASObject> = [];

    constructor(public nav: NavController,
                public params: NavParams,
                public actionSheet: ActionSheetController,
                public loading: LoadingController,
                public file: FileService,
                public sync: SynchronizationService,
                public alert: AlertController,
                public toast: ToastController,
                public footerToolbar: FooterToolbarService,
                public translate: TranslateService,
                public modal: ModalController,
                public dataProvider: DataProvider,
                private readonly browser: InAppBrowser,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder) {
        this.parent = params.get("parent");
        this.pageTitle = "New Content";
    }


    /**
     * Only called if page is newly loaded
     */
    ionViewDidLoad(): void {
        this.loadObjects();
    }


    private loadObjects(): void {
        User.currentUser().then(user => {
            this.user = user;
            this.loadObjectData();
        }, () => {
            // We should never get to this page if no user is logged in... just in case -> redirect to LoginPage
            this.nav.push(LoginPage);
        });
    }

    /**
     * Loads objects from local DB and then from remote
     */
    private loadObjectData(): void {
        Log.write(this, "Collecting new items from Database");
        this.footerToolbar.addJob(Job.LoadNewObjects, "");

        // we want to group the new items by course/group
        DesktopItem.findByUserId(this.user.id).then(desktopItems => {
            this.desktopItems = [];
            this.objects = {};
            this.allObjects = [];
            const promises: Array<Promise<void>> = [];

            desktopItems.forEach(desktopItem => {
                if (desktopItem.isContainer()) {
                    //get all the subitems by course/group
                    promises.push(ILIASObject.findByParentRefIdRecursive(desktopItem.refId, this.user.id).then(objects => {

                        //filter out the new ones.
                        const newObjects: Array<ILIASObject> = objects.filter(iliasObject => {
                            // return true;
                            return (iliasObject.isNew || iliasObject.isUpdated);
                        });

                        // add the new ones to the dictionary
                        newObjects.forEach(newObject => {
                            if (!this.objects[desktopItem.refId]) {
                                this.objects[desktopItem.refId] = [];
                            }
                            this.objects[desktopItem.refId].push(newObject);
                            this.allObjects.push(newObject);
                        });

                        Log.write(this, "New objects for ", desktopItem);
                        Log.write(this, "New dektopitem? ", desktopItem.isNew);
                        Log.write(this, "Add new ", desktopItem.isNew == true);
                        Log.write(this, "Found new objects", newObjects);

                        // only add course if there are new items in there.
                        if (this.objects[desktopItem.refId] || desktopItem.isNew || desktopItem.isUpdated) {
                            Log.describe(this, "Desktop items ", this.desktopItems);
                            Log.write(this, "adding desktop item.");
                            this.desktopItems.push(desktopItem);
                            this.objects[desktopItem.refId].sort(ILIASObject.compare);
                        }

                    }));
                }

            });
            return Promise.all(promises).then(() => {
                Log.write(this, "Desktop items", this.desktopItems);

                this.footerToolbar.removeJob(Job.LoadNewObjects);
            });
        }).catch((error) => {
            Log.write(this, "Collecting new items failed", error);
            this.footerToolbar.removeJob(Job.LoadNewObjects);
        });
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
        //TODO: should be moved imho
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    }

    markAllAsSeen(): void {
        const promises: Array<Promise<void|ActiveRecord>> = [];
        this.desktopItems.forEach(deskItem => {
            const promise: Promise<void> = this.mark(deskItem.refId, this.objects[deskItem.refId]);
            deskItem.isNew = false;
            deskItem.isUpdated = false;
            promises.push(promise);
            promises.push(deskItem.save());
        });
        Promise.all(promises).then(() => {
           this.desktopItems = [];
           this.allObjects = [];
           this.objects = {};
        });
    }

    markItemAsSeen(desktopItem: ILIASObject, id: number): Promise<[ActiveRecord, void]> {
        const obj: Array<ILIASObject> = this.allObjects.filter((object) => {
            return object.id == id;
        });
        desktopItem.isNew = false;
        desktopItem.isUpdated = false;

        return Promise.all([desktopItem.save(), this.mark(desktopItem.refId, obj)]);
    }

    markDesktopItemAsSeen(desktopItem: ILIASObject): Promise<void> {
        return this.mark(desktopItem.refId, this.objects[desktopItem.refId]).then(() => {
            delete this.objects[desktopItem.refId];
            Log.write(this, "allObjects", this.allObjects);
        });
    }

    /**
     * Returns the primary action for the given object
     * @param iliasObject
     * @returns {ILIASObjectAction}
     */
    protected getPrimaryAction(iliasObject: ILIASObject): ILIASObjectAction {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.nav, this.params);
        }
        if (iliasObject.type === "file") {
            return new DownloadAndOpenFileExternalAction(
              this.translate.instant("actions.download_and_open_in_external_app"),
              iliasObject,
              this.file,
              this.translate,
              this.alert
            );
        }

        return this.openInIliasActionFactory(
          this.translate.instant("actions.view_in_ilias"),
          this.linkBuilder.default().target(iliasObject.refId)
        );
    }

    /**
     * Show the action sheet for the given object
     * @param iliasObject
     */
    showActions(iliasObject: ILIASObject) {
        this.actionSheetActive = true;
        const actionButtons: Array<ActionSheetButton> = [];
        // let actions = this.objectActions.getActions(object, ILIASObjectActionsService.CONTEXT_ACTION_MENU);
        const actions: Array<ILIASObjectAction> = [
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav),
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId)),
        ];
        if (iliasObject.isContainer()) {
            if (!iliasObject.isFavorite) {
                actions.push(
                  new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"),
                    iliasObject,
                    this.sync)
                );
            } else if (iliasObject.isFavorite && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject, this.file));
                actions.push(
                  new SynchronizeAction(this.translate.instant("actions.synchronize"),
                    iliasObject,
                    this.sync,
                    this.modal,
                    this.translate)
                );
            }
            actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), iliasObject, this.file, this.translate));
        }

        actions.forEach(action => {
            actionButtons.push({
                text: action.title,
                handler: (): void => {
                    this.actionSheetActive = false;
                    // This action displays an alert before it gets executed
                    if (action.alert()) {
                        const alert: Alert = this.alert.create({
                            title: action.alert().title,
                            subTitle: action.alert().subTitle,
                            buttons: [
                                {
                                    text: "Cancel",
                                    role: "cancel"
                                },
                                {
                                    text: "Ok",
                                    handler: (): void => {
                                        this.executeAction(action);
                                    }
                                }
                            ]
                        });
                        alert.present();
                    } else {
                        this.executeAction(action);
                    }
                }
            });
        });
        actionButtons.push({
            text: this.translate.instant("cancel"),
            role: "cancel",
            handler: (): void => {
                this.actionSheetActive = false;
            }
        });
        const actionSheet: ActionSheet = this.actionSheet.create({
            "title": iliasObject.title,
            "buttons": actionButtons
        });
        actionSheet.onDidDismiss(() => {
            this.actionSheetActive = false;
        });
        actionSheet.present();
    }

    /**
     * @param desktopItemRefId
     * @param objects
     * @returns {Promise<any>}
     */
    async mark(desktopItemRefId: number, objects: Array<ILIASObject>): Promise<void> {
        if (!objects) {
            return;
        }
        const promises: Array<Promise<ActiveRecord>> = [];
        this.footerToolbar.addJob(Job.MarkFiles, "");
        objects.forEach((item: ILIASObject) => {
            item.isNew = false;
            item.isUpdated = false;
            promises.push(item.save());
            this.removeFromList(desktopItemRefId, item);
        });
        return Promise.all(promises).then(() => {
            this.footerToolbar.removeJob(Job.MarkFiles);
        }).catch(() => {
            this.footerToolbar.removeJob(Job.MarkFiles);
        });
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

    executeAction(action: ILIASObjectAction): void {
        const hash: number = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then((result) => {
            this.handleActionResult(result);
            this.footerToolbar.removeJob(hash);
        }).catch(error => {
            if (error instanceof CantOpenFileTypeException) {
                this.showAlert(this.translate.instant("actions.cant_open_file"));
                this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(error => {
            if (error instanceof OfflineException) {
                this.showAlert(this.translate.instant("actions.offline_and_no_local_file"));
                this.footerToolbar.removeJob(hash);
                return Promise.resolve();
            }
            return Promise.reject(error);
        }).catch(error => {
            if (error instanceof RESTAPIException) {
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

    protected showAlert(message: string): void {
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

    removeFromList(desktopItemRefId: number, item: ILIASObject): void {
        this.extractFromArray(item, this.allObjects);
        this.extractFromArray(item, this.objects[desktopItemRefId]);
    }

    extractFromArray(item: ILIASObject, list: Array<ILIASObject>): void {
        let index: string = "";
        for (const key in list) {
            const object: ILIASObject = list[key];
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
}
