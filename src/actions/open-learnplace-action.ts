import {LoadingPage} from "../app/fallback/loading/loading.component";
import {
    ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage,
    ILIASObjectActionResult
} from "./object-action";
import {LearnplaceLoader} from "../learnplace/services/loader/learnplace";
import {NavController, ModalController, Modal} from "ionic-angular";
import {TabsPage, TabsPageParams} from "../learnplace/pages/tabs/tabs.component";
import {InjectionToken} from "@angular/core";

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
        private readonly modalController: ModalController
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {

        const loadingPage: Modal = this.modalController.create(LoadingPage);
        await loadingPage.present();
        try {
            await this.loader.load(this.learnplaceObjectId);
            await loadingPage.dismiss();

            await this.nav.push(TabsPage, <TabsPageParams>{learnplaceObjectId: this.learnplaceObjectId, learnplaceName: this.learnplaceName});

            return new ILIASObjectActionNoMessage();
        }
        catch (error) {
            await loadingPage.dismiss();
            throw error;
        }
    }

    alert(): ILIASObjectActionAlert {
        return null;
    }
}

export interface OpenLearnplaceActionFunction {
    (nav: NavController, learnplaceObjectId: number, learnplaceName: string, modalController: ModalController): OpenLearnplaceAction }
export const OPEN_LEARNPLACE_ACTION_FACTORY: InjectionToken<OpenLearnplaceAction> = new InjectionToken("token for open learnplace action factory");

