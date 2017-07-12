import {NavController} from "ionic-angular/index";
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ObjectListPage} from "../pages/object-list/object-list";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";

export class ShowObjectListPageAction extends ILIASObjectAction {

    public constructor(public title:string, public object:ILIASObject, public nav:NavController) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.nav.push(ObjectListPage, {parent: this.object}).then(() => {
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