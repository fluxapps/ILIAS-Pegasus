/** angular */
import {Component} from "@angular/core";
import {ModalController, NavParams} from "@ionic/angular";
/** ionic-native */
import {InAppBrowserOptions} from "@ionic-native/in-app-browser";
/** logging */
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {ThemeColorService} from "../../services/theme-color.service";


@Component({
    templateUrl: "leave-app.dialog.html"
})
export class LeaveAppDialog {

    private readonly log: Logger = Logging.getLogger(LeaveAppDialog.name);
    private readonly params: LeaveAppDialogNavParams;
    private themeIonicContrastColor: string;

    constructor(
        private readonly nav: NavParams,
        private readonly modalCtrl: ModalController,
        private readonly translate: TranslateService
    ) {
        this.params = <LeaveAppDialogNavParams>nav.data;
    }

    ionViewWillEnter(): void {
        this.themeIonicContrastColor = "light";
        if(ThemeColorService.customIsSet) {
            this.themeIonicContrastColor = ThemeColorService.customColorContrast ? "light" : "dark";
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
