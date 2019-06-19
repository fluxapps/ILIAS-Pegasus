import {Injectable} from "@angular/core";
import {User} from "../models/user";
import {DesktopData, ILIASRestProvider} from "./ilias-rest.provider";
import {ILIASObject} from "../models/ilias-object";
import {DesktopItem} from "../models/desktop-item";
import {DataProviderFileObjectHandler} from "./handlers/file-object-handler";
import {Log} from "../services/log.service";
import {Profiler} from "../util/profiler";

@Injectable()
export class DataProvider {

    constructor(private readonly rest: ILIASRestProvider,
                private readonly fileObjectHandler: DataProviderFileObjectHandler) {
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
     * @param refreshFiles
     * @returns {Promise<ILIASObject[]>}
     */
    getObjectData(parentObject: ILIASObject, user: User, recursive: boolean, refreshFiles: boolean = true): Promise<Array<ILIASObject>> {
        return this.rest.getObjectData(parentObject.refId, user, recursive)
            .then(data =>
                this.storeILIASObjects(data, user, parentObject, recursive, refreshFiles)
            )
            .then(objects =>
                objects.sort(ILIASObject.compare)
            );
    }

    /**
     * Creates or updates an ILIASObject based on data by a given JS-object (fetched from remote)
     * @param object
     * @param user
     * @param rootParent
     * @param refreshFiles
     * @returns {Promise<ILIASObject>}
     */
    private storeILIASObject(object: DesktopData, user: User, rootParent: ILIASObject|undefined = undefined, refreshFiles: boolean = true): Promise<ILIASObject> {
        Log.write(this, "Storing ILIAS Object");

        let the_iliasObject: ILIASObject = undefined;

        return ILIASObject.findByRefId(parseInt(object.refId, 10), user.id)
            .then(iliasObject => {
                iliasObject.readFromObject(object);
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
                        return iliasObject.save() as Promise<ILIASObject>;
                    }
                } else {
                    return Promise.resolve(iliasObject);
                }
            });
    }

    private onSaveFile(user: User, iliasObject: ILIASObject): Promise<ILIASObject> {

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
    protected storeILIASDesktopObjects(objects: Array<DesktopData>, user: User): Promise<Array<ILIASObject>> {
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
     * @param refreshFiles
     * @returns {Promise<ILIASObject[]>}
     */
    private storeILIASObjects(remoteObjects: Array<DesktopData>, user: User, parentObject: ILIASObject, recursive: boolean = false, refreshFiles: boolean = true): Promise<Array<ILIASObject>> {

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
     * @param refreshFiles
     * @returns {Promise<ILIASObject[]>}
     */
    private saveOrDeleteObjects(remoteObjects: Array<DesktopData>, existingObjects: Array<ILIASObject>, user: User, rootParent: ILIASObject, refreshFiles: boolean = true): Promise<Array<ILIASObject>> {
        const id: string = (rootParent) ? rootParent.refId.toString() : "-1";
        Profiler.addTimestamp("saveOrDeleteObjects-start", false, "PD/getObjectData", id);
        const iliasObjects: Array<ILIASObject> = [];
        const promises: Array<Promise<void>> = [];
        const objectsToDelete: Array<ILIASObject> = existingObjects;
        Log.describe(this, "Existing Objects.", existingObjects);
        remoteObjects.forEach(remoteObject => {
            const promise: Promise<void> = this.storeILIASObject(remoteObject, user, rootParent, refreshFiles).then((iliasObject) => {
                iliasObjects.push(iliasObject);
                // Check if the stored object exists already locally, if so, remove it from objectsToDelete
                const objectIndex: number = existingObjects.findIndex(existingObject => {
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

            Profiler.addTimestamp("store-promise-done", false, "PD/getObjectData", id);
            return Promise.resolve(iliasObjects);
        });
    }

    /**
     * Deletes a given ILIAS Object from local DB
     * Note: This is fired async atm, we don't care about the result
     * @param iliasObject
     * @param user
     */
    private deleteObject(iliasObject: ILIASObject, user: User): Promise<object> {
        const promises: Array<Promise<object>> = [];
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
