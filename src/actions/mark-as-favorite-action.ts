import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";

export class MarkAsFavoriteAction extends ILIASObjectAction {

    constructor(public title: string,
                       public object: ILIASObject) {
        super();
    }

    execute(): Promise<ILIASObjectActionResult> {

            this.object.isFavorite = true;
            return this.object.save()
                .then( () => Promise.resolve(new ILIASObjectActionNoMessage()) );
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }

}