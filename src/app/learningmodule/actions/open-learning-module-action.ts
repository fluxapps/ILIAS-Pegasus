import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage} from "../../fallback/loading/loading.component";
import {LearningModuleLoader} from "../services/learning-module-loader";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {LearningModule} from "../../models/learning-module";
import {ILIASObject} from "../../models/ilias-object";
import {LearningModulePathBuilder} from "../services/learning-module-path-builder";
import {TranslateService} from "@ngx-translate/core";

export class OpenLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly loader: LearningModuleLoader,
        private readonly nav: NavController,
        private readonly learningModuleObjectId: number,
        private readonly learningModuleName: string,
        private readonly modal: ModalController,
        private readonly browser: InAppBrowser,
        private readonly pathBuilder: LearningModulePathBuilder,
        private readonly translate: TranslateService,
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        await loadingPage.present();
        try {
            const user: User = AuthenticationProvider.getUser();
            const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(this.learningModuleObjectId, user.id);
            if(!obj.isFavorite) await this.loader.load(this.learningModuleObjectId);
            this.openHTMLModule();
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    async openHTMLModule(): Promise<void> {
        console.log("opening learning module");
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

export interface OpenLearningModuleActionFunction {
    (
        nav: NavController,
        learningModuleObjectId: number,
        learningModuleName: string,
        modalController: ModalController,
        browser: InAppBrowser,
        pathBuilder: LearningModulePathBuilder,
        translate: TranslateService,
    ): OpenLearningModuleAction
}

export const OPEN_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenLearningModuleAction> = new InjectionToken("token for open learning module action factory");
