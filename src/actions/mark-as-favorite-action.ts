import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";

export class MarkAsFavoriteAction extends ILIASObjectAction {

    public constructor(public title:string,
                       public object:ILIASObject) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {

            this.object.isFavorite = true;
            return this.object.save()
                .then( () => Promise.resolve(new ILIASObjectActionNoMessage()) );
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }

}