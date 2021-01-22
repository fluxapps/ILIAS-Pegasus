/** angular */
import { InjectionToken } from "@angular/core";
import { SafariViewController } from "@ionic-native/safari-view-controller/ngx";
import { ModalController, Platform } from "@ionic/angular";
/** ionic-native */
import { InAppBrowser, InAppBrowserOptions } from "@ionic-native/in-app-browser/ngx";
/** logging */
import { Logger } from "../services/logging/logging.api";
import { Logging } from "../services/logging/logging.service";
/** misc */
import { ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionResult, ILIASObjectActionNoMessage } from "./object-action";
import { Builder } from "../services/builder.base";
import { IllegalStateError } from "../error/errors";
import { LeaveAppAction, LeaveAppDialog, LeaveAppDialogNavParams } from "../fallback/open-browser/leave-app.dialog";


export class OpenObjectInILIASAction extends ILIASObjectAction {

    private readonly log: Logger = Logging.getLogger(OpenObjectInILIASAction.name);
    private openDialog: Promise<HTMLIonModalElement> | undefined = undefined;

    constructor(
        readonly title: string,
        private readonly target: Builder<Promise<string>>,
        private readonly browser: InAppBrowser,
        private readonly platform: Platform,
        private readonly modal: ModalController,
        private readonly safariViewController: SafariViewController,
    ) {
        super()
    }

    async execute(): Promise<ILIASObjectActionResult> {
        const ilasLink: string = await this.target.build();

        if (this.platform.is("android")) this.openUserDialog(() => this.openBrowserAndroid(ilasLink));
        else if (this.platform.is("ios")) this.openUserDialog(() => this.openBrowserIos(ilasLink));
        else throw new IllegalStateError("Unsupported platform, unable to open browser for unsupported platform.");

        return new ILIASObjectActionNoMessage();
    }

    private async openUserDialog(leaveAction: LeaveAppAction): Promise<void> {
        if (this.openDialog !== undefined) {
            return;
        }

        this.log.debug(() => "Open leave app modal.");

        // Safe modal ref before resolving promise, which stops the user from opening it more than once
        this.openDialog = this.modal.create({
            component: LeaveAppDialog,
            componentProps: <LeaveAppDialogNavParams>{
                leaveApp: (): void => {
                    this.modal.dismiss();
                    leaveAction();
                }
            },
            cssClass: "modal-fullscreen",
        });
        const modal: HTMLIonModalElement = await this.openDialog;
        await modal.present();
        await modal.onDidDismiss();
        this.openDialog = undefined;
    }

    private async openBrowserIos(link: string): Promise<void> {
        this.log.trace(() => `Navigate to url: ${link}`);
        const sfViewControllerAvailable: boolean = await this.safariViewController.isAvailable();

        const uri: string = encodeURI(link);
        if (sfViewControllerAvailable) {
            // Use SFViewController
            this.log.trace(() => "Open ios browser (SFViewController).");
            this.safariViewController.show({
                url: uri,
                hidden: false,
                animated: true,
                transition: "curl",
                enterReaderModeIfAvailable: false,
                tintColor: getComputedStyle(document.body).getPropertyValue("--ion-color-primary-tint")
            }).subscribe((result: {event: string}) => {
                switch (result.event) {
                    case "opened":
                        this.log.debug(() => "SFViewController open event")
                        break;
                    case "loaded":
                        this.log.debug(() => "SFViewController open event")
                        break;
                    case "closed":
                        this.log.debug(() => "SFViewController open event")
                        break;
                }
                },
                (error: unknown) => console.error(() => `Encountered error while opening SFViewController: ${JSON.stringify(error)}`)
            );
        } else {
            // Use WKWebView
            this.log.trace(() => "Open ios browser (WKWebView).");
            const options: InAppBrowserOptions = {
                location: "no",
                clearcache: "yes",
                clearsessioncache: "yes"
            };

            //encode url or the browser will be stuck in a loading screen of death as soon as it reads the | character. (20.02.18)
            this.browser.create(uri, "_blank", options);
        }

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

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}

export const OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY: InjectionToken<(title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction> =
    new InjectionToken<(title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction>("token for open in ILIAS action");
