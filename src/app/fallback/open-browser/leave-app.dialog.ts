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
import { ViewController } from "@ionic/core";


@Component({
    templateUrl: "leave-app.dialog.html",
    styleUrls: ["leave-app.scss"]
})
export class LeaveAppDialog {

    private readonly log: Logger = Logging.getLogger("LeaveAppDialog");
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

    async dismiss(): Promise<void> {
        this.log.trace(() => "User action -> dismiss");
        await this.modalCtrl.dismiss({}, "cancel");
    }

    async leaveApp(): Promise<void> {
        this.log.trace(() => "User action -> leave app");

        // The leave app function is responsible for closing the modal, because it somehow does not work in here
        this.params.leaveApp();
    }
}

export interface LeaveAppAction {
    (): void
}

export interface LeaveAppDialogNavParams {
    leaveApp: LeaveAppAction;
}
