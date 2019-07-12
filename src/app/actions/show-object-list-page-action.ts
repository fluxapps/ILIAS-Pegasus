/** angular */
import {NavController} from "@ionic/angular";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";
import {ObjectListPage} from "../pages/object-list/object-list";

export class ShowObjectListPageAction extends ILIASObjectAction {

    constructor(public title: string, public object: ILIASObject, public navCtrl: NavController) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        ObjectListPage.setParent(this.object);
        return new Promise((resolve, reject) => {
            this.navCtrl.navigateForward("tabs/content").then(() => {
                resolve(new ILIASObjectActionNoMessage());
            }).catch(error =>{
                reject(error);
            });
        });
    }

    alert(): ILIASObjectActionAlert|any {
        return undefined;
    }
}
