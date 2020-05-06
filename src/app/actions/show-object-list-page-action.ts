/** angular */
import {NavController} from "@ionic/angular";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";
import {ObjectListNavParams} from "../pages/object-list/object-list.nav-params";

export class ShowObjectListPageAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public navCtrl: NavController
    ) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        ObjectListNavParams.child = this.object;
        const tab: string = ObjectListNavParams.favorites ? "favorites" : "content";
        const depth: number = ObjectListNavParams.depth+1;
        await this.navCtrl.navigateForward(`tabs/${tab}/${depth}`);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}
