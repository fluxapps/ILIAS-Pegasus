import {NavController} from "ionic-angular/index";
import {ObjectDetailsPage} from "../pages/object-details/object-details";
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";

export class ShowDetailsPageAction extends ILIASObjectAction {

    public constructor(public title:string, public object:ILIASObject, public nav:NavController) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.nav.push(ObjectDetailsPage, {object: this.object}).then(() => {
                resolve(new ILIASObjectActionNoMessage());
            }).catch(error =>{
                reject(error);
            });
        });
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }
}