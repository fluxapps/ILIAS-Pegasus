import { InjectionToken } from "@angular/core";
import { ModalController, NavController } from "@ionic/angular";
import { ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult } from "../../actions/object-action";
import { LoadingPage, LoadingPageType } from "../../fallback/loading/loading.component";
import { LeaveAppDialogService } from "../../fallback/open-browser/leave-app.service";
import { User } from "../../models/user";
import { AuthenticationProvider } from "../../providers/authentication.provider";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";
import { LearningModuleManager } from "../services/learning-module-manager";

export class OpenScormLearningModuleAction extends ILIASObjectAction {

    private readonly log: Logger = Logging.getLogger("OpenScormLearningModuleAction");

    constructor(
        private readonly learningModuleObjectId: number,
        private readonly modal: ModalController,
        private readonly navCtrl: NavController,
        private readonly learningModuleManager: LearningModuleManager,
        private readonly leaveAppDialogService: LeaveAppDialogService
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
            await this.leaveAppDialogService.present();
        }
    }

    async openSCORMModule(): Promise<void> {
        this.log.info(() => "Opening SCORM learning module");
        await this.navCtrl.navigateForward(["/learningmodule", "sahs", this.learningModuleObjectId]);
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
