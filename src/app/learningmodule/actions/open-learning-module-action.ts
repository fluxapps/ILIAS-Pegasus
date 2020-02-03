import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage} from "../../fallback/loading/loading.component";
import {LearningModuleLoader} from "../services/loader";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";

export class OpenLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly loader: LearningModuleLoader,
        private readonly nav: NavController,
        private readonly learningModuleObjectId: number,
        private readonly learningModuleName: string,
        private readonly modal: ModalController,
        private readonly browser: InAppBrowser,
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        await loadingPage.present();
        try {
            const startFile: string = await this.loader.load(this.learningModuleObjectId);
            //TODO dev open the module
            this.openHTMLModule(startFile);
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    openHTMLModule(startFile: string): void { // TODO dev
        console.log("opening HTML-module");
        const browserOptions: InAppBrowserOptions = {
            location: "no", clearsessioncache: "yes", clearcache: "yes", footer:"yes", closebuttoncaption: "TODO dev"
        };
        this.browser.create(startFile, "_blank", browserOptions);
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}

export interface OpenLearningModuleActionFunction {
    (nav: NavController, learningModuleObjectId: number, learningModuleName: string, modalController: ModalController, browser: InAppBrowser): OpenLearningModuleAction }
export const OPEN_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenLearningModuleAction> = new InjectionToken("token for open learning module action factory");
