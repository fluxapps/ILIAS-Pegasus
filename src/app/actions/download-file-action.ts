/** angular */
import {AlertController} from "@ionic/angular";
/** models */
import {ILIASObject} from "../models/ilias-object";
import {User} from "../models/user";
import {Settings} from "../models/settings";
/** logging */
import {Log} from "../services/log.service";
/** misc */
import {
    ILIASObjectActionNoMessage,
    ILIASObjectActionSuccess,
    ILIASObjectActionResult,
    ILIASObjectAction,
    ILIASObjectActionAlert
} from "./object-action";
import {TranslateService} from "@ngx-translate/core";
import {FileService} from "../services/file.service";
import {OfflineException} from "../exceptions/OfflineException";

export class DownloadFileAction extends ILIASObjectAction {


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
            throw new OfflineException("File requireds download and is offline at the same time.");

        if (this.fileObject.needsDownload)
            return this.wlanAndDownload();

        await this.file.open(this.fileObject);
        return new ILIASObjectActionNoMessage();
    }

    wlanAndDownload(): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject): void => {

            User.find(this.fileObject.userId).then(user => {
                Settings.findByUserId(user.id).then(settings => {
                    if (settings.shouldntDownloadBecauseOfWLAN()) {
                        const alert: Promise<HTMLIonAlertElement> = this.alerter.create({
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
                                        this.download(resolve, reject);
                                    }
                                }
                            ]
                        }).then((it: HTMLIonAlertElement) => {it.present(); return undefined;});
                    } else {
                        this.download(resolve, reject);
                    }
                });
            });
        });

    }

    download(resolve, reject): void {
        this.file.download(this.fileObject, true).then(() => {
            resolve(new ILIASObjectActionSuccess(this.translate.instant("actions.download_successful")));
        }, (error) => {
            Log.describe(this, "Could not download file: ", error);
            reject(new Error(this.translate.instant("actions.offline_and_no_local_file")));
        });
    };

    alert(): ILIASObjectActionAlert {
        return undefined;
    }

}
