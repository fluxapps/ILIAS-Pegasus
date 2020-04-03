import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage, LoadingPageType} from "../../fallback/loading/loading.component";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {LearningModuleManager} from "../services/learning-module-manager";

export class OpenScormLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly learningModuleObjectId: number,
        private readonly modal: ModalController,
        private readonly navCtrl: NavController,
        private readonly learningModuleManager: LearningModuleManager,
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        LoadingPage.type = LoadingPageType.learningmodule;
        await loadingPage.present();
        try {
            const user: User = AuthenticationProvider.getUser();
            await this.learningModuleManager.checkAndDownload(this.learningModuleObjectId, user.id);
            this.openSCORMModule();
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    async openSCORMModule(): Promise<void> {
        console.log("opening SCORM learning module");
        await this.navCtrl.navigateForward(["learningmodule", this.learningModuleObjectId]);
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}

export interface OpenScormLearningModuleActionFunction {
    (
        learningModuleObjectId: number,
        navCtrl: NavController,
    ): OpenScormLearningModuleAction
}

export const OPEN_SCORM_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenScormLearningModuleAction> = new InjectionToken("token for open learning module action factory");
