import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage} from "../../fallback/loading/loading.component";
import {LearningModuleLoader} from "../services/loader";

export class OpenLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly loader: LearningModuleLoader,
        private readonly nav: NavController,
        private readonly learningModuleObjectId: number,
        private readonly learningModuleName: string,
        private readonly modal: ModalController
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        await loadingPage.present();
        try {
            await this.loader.load(this.learningModuleObjectId);
            //TODO dev open the module
            setTimeout(() => loadingPage.dismiss(), 2000);
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}

export interface OpenLearningModuleActionFunction {
    (nav: NavController, learningModuleObjectId: number, learningModuleName: string, modalController: ModalController): OpenLearningModuleAction }
export const OPEN_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenLearningModuleAction> = new InjectionToken("token for open learning module action factory");
