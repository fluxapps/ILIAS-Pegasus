/** angular */
import {NavController} from "@ionic/angular";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";
import {ObjectListPage} from "../pages/object-list/object-list";
import {ActivatedRoute} from "@angular/router";

export class ShowObjectListPageAction extends ILIASObjectAction {

    constructor(
        public title: string,
        public object: ILIASObject,
        public navCtrl: NavController
    ) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        ObjectListPage.setNavChild(this.object);
        return new Promise((resolve, reject) => {
            const tab: string = ObjectListPage.nav.favorites ? "favorites" : "content";
            const depth: number = ObjectListPage.nav.depth+1;
            this.navCtrl.navigateForward(`tabs/${tab}/${depth}`)
                .then(() => resolve(new ILIASObjectActionNoMessage()))
                .catch(reject)
        });
    }

    alert(): ILIASObjectActionAlert|any {
        return undefined;
    }
}
