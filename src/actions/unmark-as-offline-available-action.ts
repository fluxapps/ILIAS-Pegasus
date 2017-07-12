import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";

export class UnMarkAsOfflineAvailableAction extends ILIASObjectAction {

    public constructor(public title:string,
                       public object:ILIASObject) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            this.object.isOfflineAvailable = false;
            this.object.offlineAvailableOwner = null;
            this.unmarkChildrenAsOfflineAvailable(this.object);
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

    /**
     * Recursively unsets children of given object to "offline available"
     * Note: We don't wait for the async ILIASObject::save() operation here
     * @param iliasObject
     */
    public unmarkChildrenAsOfflineAvailable(iliasObject:ILIASObject) {
        ILIASObject.findByParentRefId(iliasObject.refId, iliasObject.userId).then(children => {
            for (let child of children) {
                child.isOfflineAvailable = false;
                child.offlineAvailableOwner = null;
                child.save();
                this.unmarkChildrenAsOfflineAvailable(child);
            }
        });
    }


}