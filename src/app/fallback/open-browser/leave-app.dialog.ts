/** angular */
import {Component} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
/** ionic-native */
import {InAppBrowserOptions} from "@ionic-native/in-app-browser";
/** logging */
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";


@Component({
  templateUrl: "leave-app.dialog.html"
})
export class LeaveAppDialog {

  private readonly log: Logger = Logging.getLogger(LeaveAppDialog.name);

  private readonly params: LeaveAppDialogNavParams;

  constructor(
    nav: NavParams,
    private readonly viewCtrl: ViewController,
    private readonly translate: TranslateService
  ) {
    this.params = <LeaveAppDialogNavParams>nav.data;
  }

  dismiss(): void {
    this.log.trace(() => "User action -> dismiss");
    this.viewCtrl.dismiss();
  }

  leaveApp(): void {
    this.log.trace(() => "User action -> leave app");
    const options: InAppBrowserOptions = {
      location: "yes",
      clearcache: "yes",
      clearsessioncache: "yes"
    };

    this.params.leaveApp();
    this.viewCtrl.dismiss();
  }
}

export interface LeaveAppAction {
  (): void
}

export interface LeaveAppDialogNavParams {
  leaveApp: LeaveAppAction;
}
