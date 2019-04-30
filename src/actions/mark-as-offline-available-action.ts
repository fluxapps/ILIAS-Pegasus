import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {Log} from "../services/log.service";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {DataProvider} from "../providers/data-provider.provider";
import {ActiveRecord} from "../models/active-record";
import {User} from "../models/user";
import {SynchronizationService} from "../services/synchronization.service";
import {ModalController} from "ionic-angular";

export class MarkAsOfflineAvailableAction extends ILIASObjectAction {

    constructor(public title: string, public object: ILIASObject, public dataProvider: DataProvider, public syncService: SynchronizationService, public modal: ModalController) {
        super();
        this.object = object;
    }

    execute(): Promise<ILIASObjectActionResult> {
        this.object.isOfflineAvailable = true;
        this.object.offlineAvailableOwner = ILIASObject.OFFLINE_OWNER_USER;
        this.object.needsDownload = true;

        // Recursively mark children as offline available
        return User.find(this.object.userId)
            .then( user => this.dataProvider.getObjectData(this.object, user, true, false) )
            .then( (children) => {
                const promises = [];
                children.forEach(child => {
                    promises.push(this.setChildToOfflineAvailable(child));
                });

                return Promise.resolve(promises);
            })
            .then( () => this.object.needsDownload = true )
            .then( () => this.object.save() )
            .then( () => this.syncService.loadOfflineObjectRecursive(this.object))
            .then( () => Promise.resolve(new ILIASObjectActionNoMessage()) )
    }

    alert(): ILIASObjectActionAlert|any {
        return null;
    }

    /**
     * Recursively sets children of given object to "offline available"
     * Note: We don't wait for the async ILIASObject::save() operation here
     * @param iliasObject
     */
    protected setChildrenToOfflineAvailable(iliasObject: ILIASObject) {
        ILIASObject.findByParentRefId(iliasObject.refId, iliasObject.userId).then(children => {
            for (const child of children) {
                this.setChildToOfflineAvailable(child).catch(error => {Log.error(this, error);});
                this.setChildrenToOfflineAvailable(child);
            }
        });
    }

    protected setChildToOfflineAvailable(child: ILIASObject): Promise<ActiveRecord> {
        child.isOfflineAvailable = true;
        child.offlineAvailableOwner = ILIASObject.OFFLINE_OWNER_SYSTEM;

        return child.save();
    }

}
