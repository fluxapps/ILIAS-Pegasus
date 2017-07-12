import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";

export class UnMarkAsFavoriteAction extends ILIASObjectAction {

    public constructor(public title:string, public object:ILIASObject) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.object.isFavorite = false;
            this.object.save().then(() => {
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