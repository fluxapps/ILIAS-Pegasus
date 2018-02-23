import {Logger} from "../services/logging/logging.api";
import {Logging} from "../services/logging/logging.service";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionResult, ILIASObjectActionNoMessage} from "./object-action";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser";
import {Modal, ModalController, Platform} from "ionic-angular";
import {Builder} from "../services/builder.base";
import {IllegalStateError} from "../error/errors";
import {LeaveAppAction, LeaveAppDialog, LeaveAppDialogNavParams} from "../app/fallback/open-browser/leave-app.dialog";
import {InjectionToken} from "@angular/core";

export class OpenObjectInILIASAction extends ILIASObjectAction {

  private readonly log: Logger = Logging.getLogger(OpenObjectInILIASAction.name);

  constructor(
      readonly title: string,
      private readonly target: Builder<Promise<string>>,
      private readonly browser: InAppBrowser,
      private readonly platform: Platform,
      private readonly modal: ModalController
  ) { super() }

    execute(): Promise<ILIASObjectActionResult> {

      return (async(): Promise<ILIASObjectActionResult> => {

        const ilasLink: string = await this.target.build();

        if(this.platform.is("android"))   this.openUserDialog(() => this.openBrowserAndroid(ilasLink));
        else  if(this.platform.is("ios")) this.openUserDialog(() => this.openBrowserIos(ilasLink));
        else throw new IllegalStateError("Unsupported platform, unable to open browser for unsupported platform.");

        return new ILIASObjectActionNoMessage();
      })();
    }

    private openUserDialog(leaveAction: LeaveAppAction): void {
      this.log.debug(() => "Open leave app modal.");
      const modal: Modal = this.modal.create(LeaveAppDialog, <LeaveAppDialogNavParams>{
        leaveApp: leaveAction
      });
      modal.present();
    }

  private openBrowserIos(link: string): void {
    this.log.trace(() => "Open ios browser (internal).");
    this.log.trace(() => `Navigate to url: ${link}`);
    const options: InAppBrowserOptions = {
      location: "yes",
      clearcache: "yes",
      clearsessioncache: "yes"
    };

    //encode url or the browser will be stuck in a loading screen of death as soon as it reads the | character. (20.02.18)
    this.browser.create(encodeURI(link), "_blank", options);

  }

    private openBrowserAndroid(link: string): void {
      this.log.trace(() => "Open android browser (external).");
      this.log.trace(() => `Navigate to url: ${link}`);
      const options: InAppBrowserOptions = <InAppBrowserOptions>{
        location: "yes",
        clearcache: "yes",
        clearsessioncache: "yes"
      };

      this.browser.create(encodeURI(link), "_system", options);
    }

    alert(): ILIASObjectActionAlert|undefined {
        return undefined;
    }
}

export const OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY: InjectionToken<(title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction> =
  new InjectionToken<(title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction>("token for open in ILIAS action");
