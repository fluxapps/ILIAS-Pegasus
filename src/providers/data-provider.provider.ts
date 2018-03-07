import {Injectable} from "@angular/core";
import "rxjs/add/operator/toPromise";
import {User} from "../models/user";
import {ILIASRestProvider} from "./ilias-rest.provider";
import {ILIASObject} from "../models/ilias-object";
import {DesktopItem} from "../models/desktop-item";
import {DataProviderFileObjectHandler} from "./handlers/file-object-handler";
import {Log} from "../services/log.service";

@Injectable()
export class DataProvider {

    constructor(protected rest: ILIASRestProvider,
                protected fileObjectHandler: DataProviderFileObjectHandler) {
    }

    /**
     * Get ILIAS objects on desktop
     * @param user
     * @returns {Promise<ILIASObject[]>}
     */
    getDesktopData(user: User): Promise<Array<ILIASObject>> {
        return this.rest.getDesktopData(user)
            .then(data => this.storeILIASDesktopObjects(data, user))
            .then(objects => objects.sort(ILIASObject.compare));
    }


    /**
     * Fetch and store ILIAS objects under the given parent ref-ID
     * @param parentObject
     * @param user
     * @param recursive
     * @returns {Promise<ILIASObject[]>}
     */
    getObjectData(parentObject: ILIASObject, user: User, recursive, refreshFiles = true): Promise<Array<ILIASObject>> {
        //TODO: we want to update the meta data just once.
        return this.rest.getObjectData(parentObject.refId, user, recursive)
            .then((data) => this.storeILIASObjects(data, user, parentObject, recursive, refreshFiles))
            .then(objects => objects.sort(ILIASObject.compare));
    }

    /**
     * Creates or updates an ILIASObject based on data by a given JS-object (fetched from remote)
     * @param object
     * @param user
     * @param rootParent
     * @returns {Promise<ILIASObject>}
     */
    protected storeILIASObject(object: any, user: User, rootParent: ILIASObject = null, refreshFiles = true): Promise<ILIASObject> {

        Log.write(this, "Storing ILIAS Object");

        let the_iliasObject: ILIASObject = null;

        return ILIASObject.findByRefId(object.refId, user.id)
            .then(iliasObject => {
                iliasObject.readFromObject(object);

                // If the object is stored newly, we inherit the offlineAvailable flag from the parent and also mark the object as new
                if (rootParent && !iliasObject.id && rootParent.isOfflineAvailable) {
                    iliasObject.isOfflineAvailable = true;
                    iliasObject.offlineAvailableOwner = ILIASObject.OFFLINE_OWNER_SYSTEM;
                }
                the_iliasObject = iliasObject;
                return iliasObject;
            })
            .then(iliasObject => iliasObject.parent)
            .then(parent => {
                if(the_iliasObject.id == 0 && parent != undefined)
                    the_iliasObject.isNew = true;
                return the_iliasObject.save() as Promise<ILIASObject>;
            })
            .then((iliasObject: ILIASObject) => {
                if (iliasObject.type == "file") {
                    if(refreshFiles)
                        return this.onSaveFile(user, iliasObject);
                    else {
                        iliasObject.isOfflineAvailable = false;
                        return iliasObject.save() as Promise<ILIASObject>;
                    }
                } else {
                    return Promise.resolve(iliasObject);
                }
            });
    }

    protected onSaveFile(user, iliasObject: ILIASObject): Promise<ILIASObject> {

        let resolveObject: ILIASObject;

        return this.fileObjectHandler.onSave(iliasObject, user)
            .then(iliasObject => {
                resolveObject = iliasObject;
                return iliasObject.updateNeedsDownload();
            }).then(() => {
                return Promise.resolve(resolveObject);
            })
    }

    /**
     * Stores courses and groups on desktop
     * @param objects
     * @param user
     * @returns {Promise<ILIASObject[]>}
     */
    protected storeILIASDesktopObjects(objects: Array<any>, user: User): Promise<Array<ILIASObject>> {
            const iliasObjects = [];
            const promises = [];
            // We store desktop items that are only courses or groups
            objects.forEach(object => {
                const promise = this.storeILIASObject(object, user).then((iliasObject) => {
                    iliasObjects.push(iliasObject);
                });
                promises.push(promise);
            });

            Log.write(this, "Storing Objects in Cache.");
            return Promise.all(promises)
                .then( () => DesktopItem.storeDesktopItems(user.id, iliasObjects) )
                .then( () => Promise.resolve(iliasObjects) );

    }


    /**
     * Stores (create, update) local ILIAS objects from the given objects fetched from remote.
     * This method also deletes local ILIAS objects not being delivered anymore
     * @param remoteObjects
     * @param user
     * @param parentObject
     * @param recursive
     * @returns {Promise<ILIASObject[]>}
     */
    protected storeILIASObjects(remoteObjects: Array<any>, user: User, parentObject: ILIASObject, recursive = false, refreshFiles = true): Promise<Array<ILIASObject>> {

        if(recursive) {
            return ILIASObject.findByParentRefIdRecursive(parentObject.refId, user.id)
                .then(existingObjects => this.saveOrDeleteObjects(remoteObjects, existingObjects, user, parentObject, refreshFiles));
        } else {
            return ILIASObject.findByParentRefId(parentObject.refId, user.id)
                .then(existingObjects => this.saveOrDeleteObjects(remoteObjects, existingObjects, user, parentObject, refreshFiles));
        }
    }

    /**
     * @param remoteObjects
     * @param existingObjects
     * @param user
     * @param rootParent
     * @returns {Promise<ILIASObject[]>}
     */
    protected saveOrDeleteObjects(remoteObjects: Array<any>, existingObjects: Array<ILIASObject>, user: User, rootParent: ILIASObject, refreshFiles = true): Promise<Array<ILIASObject>> {
            const iliasObjects = [];
            const promises = [];
            const objectsToDelete = existingObjects;
            Log.describe(this, "Existing Objects.", existingObjects);
            remoteObjects.forEach(remoteObject => {
                const promise = this.storeILIASObject(remoteObject, user, rootParent, refreshFiles).then((iliasObject) => {
                    iliasObjects.push(iliasObject);
                    // Check if the stored object exists already locally, if so, remove it from objectsToDelete
                    const objectIndex = existingObjects.findIndex(existingObject => {
                        return existingObject.objId == iliasObject.objId;
                    });
                    if (objectIndex > -1) {
                        objectsToDelete.splice(objectIndex, 1);
                    }
                });
                promises.push(promise);
            });

            return Promise.all(promises).then(() => {
                // TODO: build the following into the chain.
                // Delete all existing objects left that were not delivered
                objectsToDelete.forEach(iliasObject => {
                    this.deleteObject(iliasObject, user);
                });

                return Promise.resolve(iliasObjects);
            });
    }

    /**
     * Deletes a given ILIAS Object from local DB
     * Note: This is fired async atm, we don't care about the result
     * @param iliasObject
     * @param user
     */
    protected deleteObject(iliasObject: ILIASObject, user: User) {
        const promises = [];
        promises.push(iliasObject.destroy());
        if (iliasObject.type == "file") {
            promises.push(this.fileObjectHandler.onDelete(iliasObject, user));
        }
        // Container object must also delete their children
        if (iliasObject.isContainer()) {
            this.getObjectData(iliasObject, user, false, true).then(iliasObjects => {
                iliasObjects.forEach(iliasObject => {
                    promises.push(this.deleteObject(iliasObject, user));
                });
            });
        }
        return Promise.all(promises);
    }


}
