import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {UnMarkAsOfflineAvailableAction} from "./unmark-as-offline-available-action";

export class UnMarkAsFavoriteAction extends ILIASObjectAction {

    readonly offlineAction: UnMarkAsOfflineAvailableAction;

    constructor(public title: string, public object: ILIASObject) {
        super();
        this.offlineAction = new UnMarkAsOfflineAvailableAction(title, object);
    }

    execute(): Promise<ILIASObjectActionResult> {
        const favPromise: Promise<ILIASObjectActionResult> = new Promise((resolve, reject) => {
            this.object.isFavorite = 0;
            this.object.save().then(() => {
                resolve(new ILIASObjectActionNoMessage());
            }).catch(error =>{
                reject(error);
            });
        });

        return this.offlineAction.execute()
            .then(() => favPromise);
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }
}
