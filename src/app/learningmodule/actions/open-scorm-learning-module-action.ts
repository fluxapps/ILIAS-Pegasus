import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LoadingPage, LoadingPageType} from "../../fallback/loading/loading.component";
import {LearningModuleLoader} from "../services/learning-module-loader";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {ILIASObject} from "../../models/ilias-object";
import {LearningModulePathBuilder} from "../services/learning-module-path-builder";
import {TranslateService} from "@ngx-translate/core";

export class OpenScormLearningModuleAction extends ILIASObjectAction {

    constructor(
        private readonly loader: LearningModuleLoader,
        private readonly nav: NavController,
        private readonly learningModuleObjectId: number,
        private readonly learningModuleName: string,
        private readonly modal: ModalController,
        private readonly pathBuilder: LearningModulePathBuilder,
        private readonly translate: TranslateService,
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
            const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(this.learningModuleObjectId, user.id);
            const alreadyLoaded: boolean = await obj.objectIsUnderFavorite();
            if(!alreadyLoaded) await this.loader.load(this.learningModuleObjectId);
            this.openSCORMModule();
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    async openSCORMModule(): Promise<void> {
        console.log("DEV here the module will be opened");
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}

export interface OpenScormLearningModuleActionFunction {
    (
        nav: NavController,
        learningModuleObjectId: number,
        learningModuleName: string,
        modalController: ModalController,
        pathBuilder: LearningModulePathBuilder,
        translate: TranslateService,
    ): OpenScormLearningModuleAction
}

export const OPEN_SCORM_LEARNING_MODULE_ACTION_FACTORY: InjectionToken<OpenScormLearningModuleAction> = new InjectionToken("token for open learning module action factory");
