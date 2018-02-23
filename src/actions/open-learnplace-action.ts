import {
  ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage,
  ILIASObjectActionResult
} from "./object-action";
import {LearnplaceLoader} from "../learnplace/services/loader/learnplace";
import {NavController} from "ionic-angular";
import {TabsPage, TabsPageParams} from "../learnplace/pages/tabs/tabs.component";

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
    private readonly learnplaceId: number,
    private readonly learnplaceName: string
  ) {super()}

  async execute(): Promise<ILIASObjectActionResult> {

    await this.loader.load(this.learnplaceId);

    await this.nav.push(TabsPage, <TabsPageParams>{learnplaceId: this.learnplaceId, learnplaceName: this.learnplaceName});

    return new ILIASObjectActionNoMessage();
  }

  alert(): ILIASObjectActionAlert {
    return null;
  }
}

export interface OpenLearnplaceActionFunction {

  (nav: NavController, learnplaceId: number, learnplaceName: string): OpenLearnplaceAction
}

