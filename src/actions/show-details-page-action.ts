/** angular */
import {NavController} from "ionic-angular";
/** misc */
import {ObjectDetailsPage} from "../pages/object-details/object-details";
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionNoMessage, ILIASObjectActionResult} from "./object-action";

export class ShowDetailsPageAction extends ILIASObjectAction {

    constructor(public title: string, public object: ILIASObject, public nav: NavController) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.nav.push(ObjectDetailsPage, {object: this.object}).then(() => {
                resolve(new ILIASObjectActionNoMessage());
            }).catch(error =>{
                reject(error);
            });
        });
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }
}
