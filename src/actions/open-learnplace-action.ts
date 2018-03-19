import {
    ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage,
    ILIASObjectActionResult
} from "./object-action";
import {LearnplaceLoader} from "../learnplace/services/loader/learnplace";
import {NavController} from "ionic-angular";
import {TabsPage, TabsPageParams} from "../learnplace/pages/tabs/tabs.component";
import {InjectionToken} from "@angular/core";
import {Builder} from "../services/builder.base";
import {OpenObjectInILIASAction} from "./open-object-in-ilias-action";

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
        private readonly learnplaceName: string
    ) {super()}

    async execute(): Promise<ILIASObjectActionResult> {

        await this.loader.load(this.learnplaceObjectId);

        await this.nav.push(TabsPage, <TabsPageParams>{learnplaceObjectId: this.learnplaceObjectId, learnplaceName: this.learnplaceName});

        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert {
        return null;
    }
}

export interface OpenLearnplaceActionFunction { (nav: NavController, learnplaceObjectId: number, learnplaceName: string): OpenLearnplaceAction }
export const OPEN_LEARNPLACE_ACTION_FACTORY: InjectionToken<OpenLearnplaceAction> = new InjectionToken("token for open learnplace action factory");
