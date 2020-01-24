import {LoadingPage} from "../../fallback/loading/loading.component";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "../../actions/object-action";
import {LearnplaceLoader} from "../services/loader/learnplace";
import {ModalController, NavController} from "@ionic/angular";
import {InjectionToken} from "@angular/core";
import {LearnplaceNavParams} from "../pages/learnplace-tabs/learnplace.nav-params";

/**
 * Opens a learnplace. A learnplace has its own view and content.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class OpenLearnplaceAction extends ILIASObjectAction {

    constructor(
        private readonly loader: LearnplaceLoader,
        private readonly nav: NavController,
        private readonly learnplaceObjectId: number,
        private readonly learnplaceName: string,
        private readonly modal: ModalController
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {
        const loadingPage: HTMLIonModalElement = await this.modal.create({
            component: LoadingPage,
            cssClass: "modal-fullscreen"
        });
        await loadingPage.present();
        try {
            await this.loader.load(this.learnplaceObjectId);
            LearnplaceNavParams.learnplaceObjectId = this.learnplaceObjectId;
            LearnplaceNavParams.learnplaceName = this.learnplaceName;
            await this.nav.navigateForward(["learnplace", this.learnplaceObjectId]);
            await loadingPage.dismiss();
            return new ILIASObjectActionNoMessage();
        } catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    alert(): ILIASObjectActionAlert {
        return undefined;
    }
}

export interface OpenLearnplaceActionFunction {
    (nav: NavController, learnplaceObjectId: number, learnplaceName: string, modalController: ModalController): OpenLearnplaceAction }
export const OPEN_LEARNPLACE_ACTION_FACTORY: InjectionToken<OpenLearnplaceAction> = new InjectionToken("token for open learnplace action factory");

