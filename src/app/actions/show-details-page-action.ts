/** angular */
import {NavController} from "@ionic/angular";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";
import {ObjectListPage} from "../pages/object-list/object-list";

export class ShowDetailsPageAction extends ILIASObjectAction {

    constructor(public title: string, public object: ILIASObject, public nav: NavController) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        ObjectListPage.setNavDetailsObject(this.object);
        const tab: string = ObjectListPage.nav.favorites ? "favorites" : "content";
        await this.nav.navigateForward(`tabs/${tab}/details`);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}
