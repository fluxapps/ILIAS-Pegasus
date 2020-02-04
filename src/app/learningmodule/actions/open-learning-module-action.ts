import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage} from "../../fallback/loading/loading.component";
import {LearningModuleLoader} from "../services/loader";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {LearningModule} from "../../models/learning-module";
import {UserStorageService} from "../../services/filesystem/user-storage.service";

export class OpenLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly loader: LearningModuleLoader,
        private readonly nav: NavController,
        private readonly learningModuleObjectId: number,
        private readonly learningModuleName: string,
        private readonly modal: ModalController,
        private readonly browser: InAppBrowser,
        private readonly userStorage: UserStorageService,
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        await loadingPage.present();
        try {
            await this.loader.load(this.learningModuleObjectId);
            this.openHTMLModule();
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    async openHTMLModule(): Promise<void> {
        console.log("opening HTML-module");
        const user: User = AuthenticationProvider.getUser();
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(this.learningModuleObjectId, user.id);

        const url: string = await lm.getLocalStartFileUrl(this.userStorage);
        const browserOptions: InAppBrowserOptions = {
            location: "no",
            clearsessioncache: "yes",
            clearcache: "yes",
            footer:"yes",
            closebuttoncaption: "TODO dev"
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
        userStorage: UserStorageService
    ): OpenLearningModuleAction
}

export const OPEN_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenLearningModuleAction> = new InjectionToken("token for open learning module action factory");
