import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {FileService} from "../services/file.service";
import {Log} from "../services/log.service";
import {TranslateService} from "ng2-translate/ng2-translate";
import {AlertController} from "ionic-angular/index";
import {Settings} from "../models/settings";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionSuccess} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {OfflineException} from "../exceptions/OfflineException";

export class DownloadAndOpenFileExternalAction extends ILIASObjectAction {

    public constructor(public title:string,
                       public fileObject:ILIASObject,
                       public file:FileService,
                       public translate:TranslateService,
                       public alerter:AlertController) {
        super();
        this.title = title;
    }

    public execute():Promise<ILIASObjectActionResult> {

        // Download is only executed if a newer version is available in ILIAS
        Log.write(this, "Do we need to download the file first? ", this.fileObject.needsDownload)
        if (this.fileObject.needsDownload && this.file.isOffline())
            return Promise.reject(new OfflineException());

        else if(this.fileObject.needsDownload)
            return Settings.findByUserId(this.fileObject.userId)
                .then( settings => this.checkWLANAndDownload(settings) );

        else
            return this.open(this.fileObject);
    }

    protected open(fileObject:ILIASObject):Promise<any> {
            return this.file.open(fileObject);
    }

    private checkWLANAndDownload(settings):Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            if (settings.shouldntDownloadBecauseOfWLAN()) {
                let alert = this.alerter.create({
                    title: this.translate.instant("actions.download_without_wlan"),
                    subTitle: this.translate.instant("actions.download_without_wlan_continue"),
                    buttons: [
                        {
                            text: this.translate.instant("cancel"),
                            role: 'cancel',
                            handler: () => {
                                resolve(new ILIASObjectActionNoMessage());
                            }
                        },
                        {
                            text: 'Ok',
                            handler: () => {
                                this.checkExceedDiskQuota(settings).then((res) => resolve(res)).catch(err => reject(err));
                            }
                        }
                    ]
                });
                alert.present();
            } else {
                this.checkExceedDiskQuota(settings).then((res) => resolve(res)).catch(err => reject(err));
            }
        });
    };

    /**
     * Download the file.
     * If we might exeed the disk quota we warn the user and ask him for permission.
     * @param settings
     * @returns {Promise<T>}
     */
    public checkExceedDiskQuota(settings:Settings):Promise<any> {
        return new Promise((resolve, reject) => {
            settings.quotaExceeds(this.fileObject).then(tooBig => {
                if (tooBig) {
                    let alert = this.alerter.create({
                        title: this.translate.instant("actions.download_without_disk_quota"),
                        subTitle: this.translate.instant("actions.download_without_disk_quota_text"),
                        buttons: [
                            {
                                text: this.translate.instant("cancel"),
                                role: 'cancel',
                                handler: () => {
                                    resolve(new ILIASObjectActionNoMessage());
                                }
                            },
                            {
                                text: 'Ok',
                                handler: () => {
                                    this.checkFileTooBigAndDownload(settings).then((res) => resolve(res)).catch(err => reject(err));
                                }
                            }
                        ]
                    });
                    alert.present();
                } else {
                    this.checkFileTooBigAndDownload(settings).then((res) => resolve(res)).catch(err => reject(err));
                }
            });
        });
    }

    /**
     * Download the file.
     * If we might exeed the disk quota we warn the user and ask him for permission.
     * @param settings
     * @returns {Promise<T>}
     */
    public checkFileTooBigAndDownload(settings:Settings):Promise<any> {
        return new Promise((resolve, reject) => {
            if (settings.fileTooBig(this.fileObject)) {
                let alert = this.alerter.create({
                    title: this.translate.instant("actions.download_with_file_too_big"),
                    subTitle: this.translate.instant("actions.download_with_file_too_big_text"),
                    buttons: [
                        {
                            text: this.translate.instant("cancel"),
                            role: 'cancel',
                            handler: () => {
                                resolve(new ILIASObjectActionNoMessage());
                            }
                        },
                        {
                            text: 'Ok',
                            handler: () => {
                                this.downloadAndOpen().then((res) => resolve(res)).catch(err => reject(err));
                            }
                        }
                    ]
                });
                alert.present();
            } else {
                this.downloadAndOpen().then((res) => resolve(res)).catch(err => reject(err));
            }
        });
    }

    public downloadAndOpen():Promise<any> {
        return this.file.download(this.fileObject, true)
            .then(() => this.file.open(this.fileObject))
            .then(() => new ILIASObjectActionSuccess(this.translate.instant("actions.download_successful")));
    };

    public alert():ILIASObjectActionAlert {
        return null;
    }

}