import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage, LoadingPageType} from "../../fallback/loading/loading.component";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";
import { LeaveAppDialogService } from "../../fallback/open-browser/leave-app.service";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {LearningModule} from "../models/learning-module";
import {LearningModulePathBuilder} from "../services/learning-module-path-builder";
import {TranslateService} from "@ngx-translate/core";
import {LearningModuleManager} from "../services/learning-module-manager";

export class OpenHtmlLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly nav: NavController,
        private readonly learningModuleObjectId: number,
        private readonly modal: ModalController,
        private readonly browser: InAppBrowser,
        private readonly translate: TranslateService,
        private readonly pathBuilder: LearningModulePathBuilder,
        private readonly learningModuleManager: LearningModuleManager,
        private readonly leaveAppDialogService: LeaveAppDialogService,
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen",
            backdropDismiss: false,
        });
        LoadingPage.type = LoadingPageType.learningmodule;
        await loadingPage.present();
        try {
            const user: User = AuthenticationProvider.getUser();
            await this.learningModuleManager.checkAndDownload(this.learningModuleObjectId, user.id);
            this.openHTMLModule();
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            await this.leaveAppDialogService.present();
        }
    }

    async openHTMLModule(): Promise<void> {
        console.log("opening HTML learning module");
        const user: User = AuthenticationProvider.getUser();
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(this.learningModuleObjectId, user.id);
        const url: string = await lm.getLocalStartFileUrl(this.pathBuilder);
        const browserOptions: InAppBrowserOptions = {
            location: "no",
            clearsessioncache: "yes",
            clearcache: "yes",
            footer:"yes",
            closebuttoncaption: this.translate.instant("close")
        };
        this.browser.create(url, "_blank", browserOptions);
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}

export interface OpenHtmlLearningModuleActionFunction {
    (
        nav: NavController,
        learningModuleObjectId: number,
        pathBuilder: LearningModulePathBuilder,
        translate: TranslateService
    ): OpenHtmlLearningModuleAction
}

export const OPEN_HTML_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenHtmlLearningModuleAction> = new InjectionToken("token for opening html learning module action factory");
