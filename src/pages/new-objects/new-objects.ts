import {Component} from '@angular/core';
import {
    NavController, NavParams, ActionSheetController, LoadingController, AlertController,
    ToastController
} from 'ionic-angular';
import {ILIASObject} from "../../models/ilias-object";
import {FileService} from "../../services/file.service";
import {User} from "../../models/user";
import {SynchronizationService} from "../../services/synchronization.service";
import {LoginPage} from "../login/login";
import {ILIASObjectAction, ILIASObjectActionSuccess} from "../../actions/object-action";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {MarkAsFavoriteAction} from "../../actions/mark-as-favorite-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {MarkAsOfflineAvailableAction} from "../../actions/mark-as-offline-available-action";
import {UnMarkAsOfflineAvailableAction} from "../../actions/unmark-as-offline-available-action";
import {SynchronizeAction} from "../../actions/synchronize-action";
import {RemoveLocalFilesAction} from "../../actions/remove-local-files-action";
import {DesktopItem} from "../../models/desktop-item";
import {FooterToolbarService} from "../../services/footer-toolbar.service";
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {Log} from "../../services/log.service";
import {TranslateService} from "ng2-translate/src/translate.service";
import {Job} from "../../services/footer-toolbar.service";
import {ModalController} from "ionic-angular/index";
import {DataProvider} from "../../providers/data-provider.provider";
import {CantOpenFileTypeException} from "../../exceptions/CantOpenFileTypeException";
import {OfflineException} from "../../exceptions/OfflineException";
import {RESTAPITimeoutException} from "../../exceptions/RESTAPITimeoutException";
import {RESTAPIException} from "../../exceptions/RESTAPIException";
import {TokenLinkRewriter} from "../../services/link-rewriter.service";


@Component({
    templateUrl: 'new-objects.html',
})
export class NewObjectsPage {

    /**
     * Objects under the given parent object
     */
    public objects: {[containerId: number]: ILIASObject[]} = {};

    /**
     * The parent container object that was clicked to display the current objects
     */
    public parent: ILIASObject;
    public pageTitle: string;
    public user: User;
    public actionSheetActive = false;
    public desktopItems: ILIASObject[] = null;
    public allObjects: ILIASObject[] = [];

    constructor(public nav: NavController,
                params: NavParams,
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
                private readonly linkRewriter: TokenLinkRewriter) {
        this.parent = params.get('parent');
        this.pageTitle = 'New Content';
    }


    /**
     * Only called if page is newly loaded
     */
    public ionViewDidLoad() {
        this.loadObjects();
    }


    protected loadObjects() {
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
    protected loadObjectData() {
        Log.write(this, "Collecting new items from Database");
        this.footerToolbar.addJob(Job.LoadNewObjects, "");

        // we want to group the new items by course/group
        DesktopItem.findByUserId(this.user.id).then(desktopItems => {
            this.desktopItems = [];
            this.objects = {};
            this.allObjects = [];
            let promises = [];

            desktopItems.forEach(desktopItem => {
                if (desktopItem.isContainer()) {
                    //get all the subitems by course/group
                    promises.push(ILIASObject.findByParentRefIdRecursive(desktopItem.refId, this.user.id).then(objects => {

                        //filter out the new ones.
                        let newObjects = objects.filter(iliasObject => {
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
                            Log.write(this, "adding desktop item.")
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
            Log.write(this, 'Collecting new items failed', error);
            this.footerToolbar.removeJob(Job.LoadNewObjects);
        });
    }

    /**
     * Execute primary action of given object
     * @param iliasObject
     */
    public onClick(iliasObject: ILIASObject) {
        if (this.actionSheetActive) return;
        let primaryAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);

        // When executing the primary action, we reset the isNew state
        //TODO: should be moved imho
        if (iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    }

    public markAllAsSeen() {
        let promises = [];
        this.desktopItems.forEach(deskItem => {
            let promise = this.mark(deskItem.refId, this.objects[deskItem.refId]);
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

    public markItemAsSeen(desktopItem: ILIASObject, id) {
        let obj = this.allObjects.filter((object) => {
            return object.id == id;
        });
        desktopItem.isNew = false;
        desktopItem.isUpdated = false;

        return Promise.all([desktopItem.save(), this.mark(desktopItem.refId, obj)]);
    }

    public markDesktopItemAsSeen(desktopItem: ILIASObject) {
        return this.mark(desktopItem.refId, this.objects[desktopItem.refId]).then(() => {
            delete this.objects[desktopItem.refId];
            Log.write(this, 'allObjects', this.allObjects);
        });
    }

    /**
     * Returns the primary action for the given object
     * @param iliasObject
     * @returns {ILIASObjectAction}
     */
    protected getPrimaryAction(iliasObject: ILIASObject): ILIASObjectAction {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.nav);
        }
        if (iliasObject.type == 'file') {
            return new DownloadAndOpenFileExternalAction(this.translate.instant("actions.download_and_open_in_external_app"), iliasObject, this.file, this.translate, this.alert);
        }

        return new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), iliasObject, this.linkRewriter);
    }

    /**
     * Show the action sheet for the given object
     * @param iliasObject
     */
    public showActions(iliasObject: ILIASObject) {
        this.actionSheetActive = true;
        let actionButtons = [];
        // let actions = this.objectActions.getActions(object, ILIASObjectActionsService.CONTEXT_ACTION_MENU);
        let actions: ILIASObjectAction[] = [
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav),
            new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), iliasObject, this.linkRewriter),
        ];
        if (!iliasObject.isFavorite) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject));
        } else if (iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject));
        }
        if (iliasObject.isContainer()) {
            if (!iliasObject.isOfflineAvailable) {
                actions.push(new MarkAsOfflineAvailableAction(this.translate.instant("actions.mark_as_offline_available"), iliasObject, this.dataProvider, this.sync, this.modal));
            } else if (iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"), iliasObject));
                actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
            }
            actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), iliasObject, this.file, this.translate));
        }

        actions.forEach(action => {
            actionButtons.push({
                text: action.title,
                handler: () => {
                    this.actionSheetActive = false;
                    // This action displays an alert before it gets executed
                    if (action.alert()) {
                        let alert = this.alert.create({
                            title: action.alert().title,
                            subTitle: action.alert().subTitle,
                            buttons: [
                                {
                                    text: 'Cancel',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Ok',
                                    handler: () => {
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
            role: 'cancel',
            handler: () => {
                this.actionSheetActive = false;
            }
        });
        let actionSheet = this.actionSheet.create({
            'title': iliasObject.title,
            'buttons': actionButtons
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
    public mark(desktopItemRefId: number, objects: ILIASObject[]) {
        if (!objects) {
            return;
        }
        let promises = [];
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


    protected handleActionResult(result) {
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

    public executeAction(action: ILIASObjectAction): void {
        let hash = action.instanceId();
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

    public removeFromList(desktopItemRefId: number, item: ILIASObject): void {
        this.extractFromArray(item, this.allObjects);
        this.extractFromArray(item, this.objects[desktopItemRefId]);
    }

    public extractFromArray(item: ILIASObject, list: ILIASObject[]) {
        let index = null;
        for (let key in list) {
            let object = list[key];
            if (object.id == item.id) {
                index = key;
                break;
            }
        }
        if (index !== null) {
            Log.describe(this, "deleting key: ", index);
            Log.describe(this, "element was: ", list[index]);
            delete list[index];
        }
    };
}
