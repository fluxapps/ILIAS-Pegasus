/** angular */
import {Alert, AlertController} from "ionic-angular";
/** models */
import {Settings} from "../models/settings";
import {ILIASObject} from "../models/ilias-object";
import {
    ILIASObjectAction,
    ILIASObjectActionAlert,
    ILIASObjectActionResult,
    ILIASObjectActionSuccess,
    ILIASObjectActionNoMessage
} from "./object-action";
/** logging */
import {Log} from "../services/log.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {OfflineException} from "../exceptions/OfflineException";
import {FileService} from "../services/file.service";

export class DownloadAndOpenFileExternalAction extends ILIASObjectAction {

    constructor(public title: string,
                       public fileObject: ILIASObject,
                       public file: FileService,
                       public translate: TranslateService,
                       public alerter: AlertController) {
        super();
        this.title = title;
    }

    async execute(): Promise<ILIASObjectActionResult> {
        // Download is only executed if a newer version is available in ILIAS
        Log.write(this, "Do we need to download the file first? ", this.fileObject.needsDownload);
        if (this.fileObject.needsDownload && this.file.isOffline())
            return Promise.reject(new OfflineException("File requireds download and is offline at the same time."));

        else if (this.fileObject.needsDownload) {
            const settings: Settings = await Settings.findByUserId(this.fileObject.userId);
            return this.checkWLANAndDownload(settings);
        }
        else {
            await this.file.open(this.fileObject);
            return new ILIASObjectActionNoMessage();
        }
    }

    private checkWLANAndDownload(settings: Settings): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject): void => {
            if (settings.shouldntDownloadBecauseOfWLAN()) {
                const alert: Alert = this.alerter.create({
                    title: this.translate.instant("actions.download_without_wlan"),
                    subTitle: this.translate.instant("actions.download_without_wlan_continue"),
                    buttons: [
                        {
                            text: this.translate.instant("cancel"),
                            role: "cancel",
                            handler: (): void => {
                                resolve(new ILIASObjectActionNoMessage());
                            }
                        },
                        {
                            text: "Ok",
                            handler: (): void => {
                                this.checkExceedDiskQuota(settings).then(resolve).catch(reject);
                            }
                        }
                    ]
                });
                alert.present();
            } else {
                this.checkExceedDiskQuota(settings).then(resolve).catch(reject);
            }
        });
    };

    /**
     * Download the file.
     * If we might exeed the disk quota we warn the user and ask him for permission.
     * @param settings
     * @returns {Promise<T>}
     */
    checkExceedDiskQuota(settings: Settings): Promise<ILIASObjectActionNoMessage> {
        return new Promise((resolve, reject): void => {
            settings.quotaExceeds(this.fileObject).then(tooBig => {
                if (tooBig) {
                    const alert: Alert = this.alerter.create({
                        title: this.translate.instant("actions.download_without_disk_quota"),
                        subTitle: this.translate.instant("actions.download_without_disk_quota_text"),
                        buttons: [
                            {
                                text: this.translate.instant("cancel"),
                                role: "cancel",
                                handler: (): void => {
                                    resolve(new ILIASObjectActionNoMessage());
                                }
                            },
                            {
                                text: "Ok",
                                handler: (): void => {
                                    this.checkFileTooBigAndDownload(settings).then(resolve).catch(reject);
                                }
                            }
                        ]
                    });
                    alert.present();
                } else {
                    this.checkFileTooBigAndDownload(settings).then(resolve).catch(reject);
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
    checkFileTooBigAndDownload(settings: Settings): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject): void => {
            if (settings.fileTooBig(this.fileObject)) {
                const alert: Alert = this.alerter.create({
                    title: this.translate.instant("actions.download_with_file_too_big"),
                    subTitle: this.translate.instant("actions.download_with_file_too_big_text"),
                    buttons: [
                        {
                            text: this.translate.instant("cancel"),
                            role: "cancel",
                            handler: (): void => {
                                resolve(new ILIASObjectActionNoMessage());
                            }
                        },
                        {
                            text: "Ok",
                            handler: (): void => {
                                this.downloadAndOpen().then(resolve).catch(reject);
                            }
                        }
                    ]
                });
                alert.present();
            } else {
                this.downloadAndOpen().then(resolve).catch(reject);
            }
        });
    }

    async downloadAndOpen(): Promise<ILIASObjectActionResult> {
      await this.file.download(this.fileObject, true);
      await this.file.open(this.fileObject);
      return new ILIASObjectActionSuccess(this.translate.instant("actions.download_successful"));
    };

    alert(): ILIASObjectActionAlert {
        return undefined;
    }

}
