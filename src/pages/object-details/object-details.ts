import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, ToastController} from 'ionic-angular';
import {ILIASObject} from "../../models/ilias-object";
import {DataProvider} from "../../providers/data-provider.provider";
import {ILIASObjectAction, ILIASObjectActionSuccess} from "../../actions/object-action";
import {SynchronizationService} from "../../services/synchronization.service";
import {FileService} from "../../services/file.service";
import {OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {MarkAsFavoriteAction} from "../../actions/mark-as-favorite-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
import {MarkAsOfflineAvailableAction} from "../../actions/mark-as-offline-available-action";
import {UnMarkAsOfflineAvailableAction} from "../../actions/unmark-as-offline-available-action";
import {SynchronizeAction} from "../../actions/synchronize-action";
import {RemoveLocalFilesAction} from "../../actions/remove-local-files-action";
import {RemoveLocalFileAction} from "../../actions/remove-local-file-action";
import {OpenFileExternalAction} from "../../actions/open-file-external-action";
import {DownloadFileAction} from "../../actions/download-file-action";
import {Log} from "../../services/log.service";
import {TranslateService} from "ng2-translate/src/translate.service";
import {ILIASObjectActionResult} from "../../actions/object-action";
import {FooterToolbarService} from "../../services/footer-toolbar.service";
import {ModalController} from "ionic-angular/index";
import {CantOpenFileTypeException} from "../../exceptions/CantOpenFileTypeException";
import {RESTAPIException} from "../../exceptions/RESTAPIException";
import {ILIASLink, TokenUrlConverter} from "../../services/url-converter.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";


@Component({
    templateUrl: 'object-details.html'
})
export class ObjectDetailsPage {

    public iliasObject: ILIASObject;

    public actions: ILIASObjectAction[];

    /**
     * Holds the details of the current displayed ILIASObject
     */
    public details:Array<{label:string, value:string}>;

    constructor(public nav: NavController,
                public dataProvider: DataProvider,
                public sync: SynchronizationService,
                public file: FileService,
                public alert: AlertController,
                public toast: ToastController,
                public translate: TranslateService,
                public footerToolbar: FooterToolbarService,
                public modal: ModalController,
                private readonly urlConverter: TokenUrlConverter,
                private readonly browser: InAppBrowser,
                params: NavParams) {
        this.iliasObject = params.get('object');
        Log.describe(this, "Showing details of: ", this.iliasObject);
    }

    public ionViewDidLoad() {
        this.loadAvailableActions();
        this.loadObjectDetails();
    }

    public executeAction(action: ILIASObjectAction) {
        if (action.alert()) {
            let alert = this.alert.create({
                title: action.alert().title,
                subTitle: action.alert().subTitle,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                            // alert.dismiss();
                        }
                    },
                    {
                        text: 'Ok',
                        handler: () => {
                            this.executeAndHandleAction(action);
                        }
                    }
                ]
            });
            alert.present();
        } else {
            this.executeAndHandleAction(action);
        }
    }

    protected executeAndHandleAction(action: ILIASObjectAction) {
        Log.write(this, "executeAndHandleAction");
        Log.describe(this, "action: ", action);
        action.execute().then(result => {
                this.actionHandler(result);
            }
        ).catch(error => {
            if (error instanceof RESTAPIException) {
                this.showAlert(this.translate.instant("actions.server_not_reachable"));
                return Promise.resolve();
            } else if (error instanceof  CantOpenFileTypeException) {
                this.showAlert(this.translate.instant("actions.cant_open_file"));
            }
            return Promise.reject(error);
        }).catch((message) => {
            if (message) {
                Log.describe(this, "action gone wrong: ", message);
            }
            this.loadAvailableActions();
            this.loadObjectDetails();
            this.showAlert(this.translate.instant("something_went_wrong"));
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

    protected actionHandler(result: ILIASObjectActionResult) {
        Log.write(this, "actionHandler");
        this.handleActionResult(result);
        this.loadAvailableActions();
        this.loadObjectDetails();
    }

    protected handleActionResult(result) {
        Log.write(this, "handleActionResult");
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

    protected loadObjectDetails() {
        this.iliasObject.presenter.details().then(details => {
            Log.describe(this, "Details are displayed: ", details);
            this.details = details;
        });
    }

    protected loadAvailableActions() {
        this.actions = [new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), new ILIASLink(this.iliasObject.link), this.urlConverter, this.browser)];
        if (!this.iliasObject.isFavorite) {
            this.actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), this.iliasObject));
        } else if (this.iliasObject.isFavorite) {
            this.actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), this.iliasObject));
        }
        if (this.iliasObject.isContainer()) {
            if (!this.iliasObject.isOfflineAvailable) {
                this.actions.push(new MarkAsOfflineAvailableAction(this.translate.instant("actions.mark_as_offline_available"), this.iliasObject, this.dataProvider, this.sync, this.modal));
            } else if (this.iliasObject.isOfflineAvailable && this.iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                this.actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"), this.iliasObject));
                this.actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), this.iliasObject, this.sync, this.modal, this.translate));
            }
            this.actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), this.iliasObject, this.file, this.translate));
        }
        if (this.iliasObject.type == 'file') {
            this.file.existsFile(this.iliasObject).then(() => {
                this.actions.push(new OpenFileExternalAction(this.translate.instant("actions.open_in_external_app"), this.iliasObject, this.file));
                this.actions.push(new RemoveLocalFileAction(this.translate.instant("actions.remove_local_file"), this.iliasObject, this.file));
            }, () => {
                Log.write(this, "No file available: Remove and Open are not available.");
            });
            if (!this.iliasObject.isOfflineAvailable) {
                this.actions.push(new MarkAsOfflineAvailableAction(this.translate.instant("actions.mark_as_offline_available"), this.iliasObject, this.dataProvider, this.sync, this.modal));
            } else if (this.iliasObject.isOfflineAvailable && this.iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                this.actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"), this.iliasObject));
            }
            if (this.iliasObject.needsDownload) {
                this.actions.push(new DownloadFileAction(this.translate.instant("actions.download"), this.iliasObject, this.file, this.translate, this.alert));
            }
        }
    }

}
