/** angular */
import {NavController} from "@ionic/angular";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";
import {ObjectListNavParams} from "../pages/object-list/object-list.nav-params";

export class ShowDetailsPageAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public navCtrl: NavController
    ) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        ObjectListNavParams.details = this.object;
        const tab: string = ObjectListNavParams.favorites ? "favorites" : "content";
        await this.navCtrl.navigateForward(`tabs/${tab}/details`);
        return new ILIASObjectActionNoMessage();
    }

    alert(): ILIASObjectActionAlert | undefined {
        return undefined;
    }
}
