import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {FileService} from "../services/file.service";
import {TranslateService} from "ng2-translate/ng2-translate";
import {Log} from "../services/log.service";
import {User} from "../models/user";
import {Settings} from "../models/settings";
import {AlertController} from "ionic-angular/index";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionSuccess} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {OfflineException} from "../exceptions/OfflineException";

export class DownloadFileAction extends ILIASObjectAction {


    public constructor(public title: string,
                       public fileObject: ILIASObject,
                       public file: FileService,
                       public translate: TranslateService,
                       public alerter: AlertController) {
        super();
        this.title = title;
    }

    public execute(): Promise<ILIASObjectActionResult> {
        // Download is only executed if a newer version is available in ILIAS
        Log.write(this, "Do we need to download the file first? ", this.fileObject.needsDownload)
        if (this.fileObject.needsDownload && this.file.isOffline())
            return Promise.reject(new OfflineException());

        if (this.fileObject.needsDownload)
            return this.wlanAndDownload();

        return this.file.open(this.fileObject);
    }

    public wlanAndDownload(): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {

            User.find(this.fileObject.userId).then(user => {
                Settings.findByUserId(user.id).then(settings => {
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
                                        this.download(resolve, reject);
                                    }
                                }
                            ]
                        });
                        alert.present();
                    } else {
                        this.download(resolve, reject);
                    }
                });
            });
        });

    }

    public download(resolve, reject) {
        this.file.download(this.fileObject, true).then(() => {
            resolve(new ILIASObjectActionSuccess(this.translate.instant("actions.download_successful")));
        }, (error) => {
            Log.describe(this, "Could not download file: ", error);
            reject(this.translate.instant("actions.offline_and_no_local_file"));
        });
    };

    public alert(): ILIASObjectActionAlert {
        return null;
    }

}