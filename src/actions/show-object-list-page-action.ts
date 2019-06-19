import {NavController, NavParams} from "ionic-angular/index";
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ObjectListPage} from "../pages/object-list/object-list";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";

export class ShowObjectListPageAction extends ILIASObjectAction {

    constructor(public title: string, public object: ILIASObject, public nav: NavController, public params: NavParams) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.nav.push(ObjectListPage, {parent: this.object, favorites: this.params.get("favorites")}).then(() => {
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
