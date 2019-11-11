/** angular */
import {NavController} from "@ionic/angular";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {ObjectListPage} from "../pages/object-list/object-list";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";

export class ShowObjectListPageAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public navCtrl: NavController
    ) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        ObjectListPage.setNavChild(this.object);
        const tab: string = ObjectListPage.nav.favorites ? "favorites" : "content";
        const depth: number = ObjectListPage.nav.depth+1;
        await this.navCtrl.navigateForward(`tabs/${tab}/${depth}`);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}
