/** angular */
import {AlertController, ModalController} from "@ionic/angular";
/** models */
import {Settings} from "../models/settings";
import {ILIASObject} from "../models/ilias-object";
import {
    ILIASObjectAction,
    ILIASObjectActionAlert,
    ILIASObjectActionResult,
    ILIASObjectActionNoMessage
} from "./object-action";
/** logging */
import {Log} from "../services/log.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {OfflineException} from "../exceptions/OfflineException";
import {FileService} from "../services/file.service";
import {SynchronizationService} from "../services/synchronization.service";
import {LoadingPage, LoadingPageType} from "../fallback/loading/loading.component";
import {catchError} from "rxjs/operators";

export class DownloadAndOpenFileExternalAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public fileObject: ILIASObject,
        public file: FileService,
        public translate: TranslateService,
        public alerter: AlertController,
        public sync: SynchronizationService,
        public modal: ModalController
    ) {
        super();
        this.title = title;
    }

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        LoadingPage.type = LoadingPageType.generic;
        await loadingPage.present();
        try {
            // Download is only executed if a newer version is available in ILIAS
            Log.write(this, "Do we need to download the file first? ", this.fileObject.needsDownload);
            if (this.fileObject.needsDownload && this.file.isOffline()) {
                await loadingPage.dismiss();
                return Promise.reject(new OfflineException("File requires download and is offline at the same time."));
            } else if (this.fileObject.needsDownload) {
                const settings: Settings = await Settings.findByUserId(this.fileObject.userId);
                const result: Promise<ILIASObjectActionResult> = this.checkWLANAndDownload(settings);
                await result.then(() => this.sync.synchronizeFileLearningProgresses());
                await loadingPage.dismiss();
                return result;
            } else {
                await this.file.open(this.fileObject);
                await this.sync.synchronizeFileLearningProgresses();
                await loadingPage.dismiss();
                return new ILIASObjectActionNoMessage();
            }
        } catch (e) {
            await loadingPage.dismiss();
            throw e;
        }
    }

    private checkWLANAndDownload(settings: Settings): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject): void => {
            if (settings.shouldntDownloadBecauseOfWLAN()) {
                this.alerter.create({
                    header: this.translate.instant("actions.download_without_wlan"),
                    message: this.translate.instant("actions.download_without_wlan_continue"),
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
                }).then((it: HTMLIonAlertElement) => {it.present(); return undefined;});
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
                    const alert: Promise<HTMLIonAlertElement> = this.alerter.create({
                        header: this.translate.instant("actions.download_without_disk_quota"),
                        message: this.translate.instant("actions.download_without_disk_quota_text"),
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
                    }).then((it: HTMLIonAlertElement) => {it.present(); return undefined;});
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
                const alert: Promise<HTMLIonAlertElement> = this.alerter.create({
                    header: this.translate.instant("actions.download_with_file_too_big"),
                    message: this.translate.instant("actions.download_with_file_too_big_text"),
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
                }).then((it: HTMLIonAlertElement) => {it.present(); return undefined;});
            } else {
                this.downloadAndOpen().then(resolve).catch(reject);
            }
        });
    }

    async downloadAndOpen(): Promise<ILIASObjectActionResult> {
      await this.file.download(this.fileObject, true);
      await this.file.open(this.fileObject);
      return new ILIASObjectActionNoMessage();
    };

    alert(): ILIASObjectActionAlert {
        return undefined;
    }

}
