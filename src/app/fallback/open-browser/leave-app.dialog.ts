/** angular */
import {Component} from "@angular/core";
import { AppVersion } from "@ionic-native/app-version/ngx";
import {ModalController, NavParams} from "@ionic/angular";
/** ionic-native */
import {InAppBrowserOptions} from "@ionic-native/in-app-browser";
/** logging */
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {CssStyleService} from "../../services/theme/css-style.service";


@Component({
    templateUrl: "leave-app.dialog.html"
})
export class LeaveAppDialog {

    private readonly log: Logger = Logging.getLogger(LeaveAppDialog.name);
    private readonly params: LeaveAppDialogNavParams;
    readonly appName: Promise<string>;
    themeIonicContrastColor: string;

    constructor(
        private readonly nav: NavParams,
        private readonly modalCtrl: ModalController,
        private readonly appVersion: AppVersion,
    ) {
        this.params = <LeaveAppDialogNavParams>nav.data;
        this.appName = this.appVersion.getAppName();
    }

    ionViewWillEnter(): void {
        this.themeIonicContrastColor = "light";
        if(CssStyleService.customIsSet) {
            this.themeIonicContrastColor = CssStyleService.customColorContrast ? "light" : "dark";
        }
    }

    dismiss(): void {
        this.log.trace(() => "User action -> dismiss");
        this.modalCtrl.dismiss();
    }

    leaveApp(): void {
        this.log.trace(() => "User action -> leave app");
        const options: InAppBrowserOptions = {
            location: "yes",
            clearcache: "yes",
            clearsessioncache: "yes"
        };

        this.params.leaveApp();
        this.modalCtrl.dismiss();
    }
}

export interface LeaveAppAction {
    (): void
}

export interface LeaveAppDialogNavParams {
    leaveApp: LeaveAppAction;
}
