/** angular */
import { Injectable } from "@angular/core";
/** models */
import { User } from "../models/user";
import { Logger } from "../services/logging/logging.api";
import { Logging } from "../services/logging/logging.service";
import { DesktopData, ILIASRestProvider } from "./ilias-rest.provider";
import { ILIASObject } from "../models/ilias-object";
import { DesktopItem } from "../models/desktop-item";
/** logging */
import { Log } from "../services/log.service";
/** misc */
import { DataProviderFileObjectHandler } from "./handlers/file-object-handler";

@Injectable({
    providedIn: "root"
})
export class DataProvider {

    private readonly log: Logger = Logging.getLogger("DataProvider");

    constructor(
        private readonly rest: ILIASRestProvider,
        private readonly fileObjectHandler: DataProviderFileObjectHandler
    ) {
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
    private async storeILIASObject(object: DesktopData, user: User, rootParent: ILIASObject | undefined = undefined, refreshFiles: boolean = true): Promise<ILIASObject> {
        Log.write(this, "Storing ILIAS Object");

        let the_iliasObject: ILIASObject = undefined;

        return ILIASObject.findByRefIdAndUserId(parseInt(object.refId, 10), user.id)
            .then(iliasObject => {
                iliasObject.readFromObject(object);
                the_iliasObject = iliasObject;
                return iliasObject;
            })
            .then(iliasObject => iliasObject.parent)
            .then(parent => {
                if (the_iliasObject.id == 0 && parent != undefined)
                    the_iliasObject.isNew = true;
                return the_iliasObject.save();
            })
            .then((iliasObject: ILIASObject) => {
                if (iliasObject.type === "file") {
                    if (refreshFiles)
                        return this.onSaveFile(user, iliasObject);
                    else {
                        return iliasObject.save() as Promise<ILIASObject>;
                    }
                } else {
                    return iliasObject;
                }
            });
    }

    private async onSaveFile(user: User, iliasObject: ILIASObject): Promise<ILIASObject> {
        const saveResult: ILIASObject = await this.fileObjectHandler.onSave(iliasObject, user);
        await iliasObject.updateNeedsDownload();
        return saveResult;
    }

    /**
     * Stores courses and groups on desktop
     * @param objects
     * @param user
     * @returns {Promise<ILIASObject[]>}
     */
    private async storeILIASDesktopObjects(objects: Array<DesktopData>, user: User): Promise<Array<ILIASObject>> {
        // We store desktop items that are only courses or groups
        this.log.debug(() => "Storing Objects in Cache");
        const results: Array<ILIASObject> = [];
        for (const desktopData of objects) {
            results.push(await this.storeILIASObject(desktopData, user));
        }

        await DesktopItem.storeDesktopItems(user.id, results);
        return results;
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

        if (recursive) {
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
    private async saveOrDeleteObjects(remoteObjects: Array<DesktopData>, existingObjects: Array<ILIASObject>, user: User, rootParent: ILIASObject, refreshFiles: boolean = true): Promise<Array<ILIASObject>> {
        const iliasObjects: Array<ILIASObject> = [];
        const objectsToDelete: Array<ILIASObject> = existingObjects;
        Log.describe(this, "Existing Objects.", existingObjects);

        for (const remoteObject of remoteObjects) {
            const iliasObject: ILIASObject = await this.storeILIASObject(remoteObject, user, rootParent, refreshFiles);
            iliasObjects.push(iliasObject);
            // Check if the stored object exists already locally, if so, remove it from objectsToDelete
            const objectIndex: number = existingObjects.findIndex(existingObject => {
                return existingObject.objId == iliasObject.objId;
            });
            if (objectIndex > -1) {
                objectsToDelete.splice(objectIndex, 1);
            }
        }

        // Delete all existing objects left that were not delivered
        for (const objectToDelete of objectsToDelete) {
            await this.deleteObject(objectToDelete, user)
        }

        return iliasObjects;
    }

    /**
     * Deletes a given ILIAS Object from local DB
     * Note: This is fired async atm, we don't care about the result
     * @param iliasObject
     * @param user
     */
    private async deleteObject(iliasObject: ILIASObject, user: User): Promise<void> {
        if (iliasObject.type === "file") {
            await this.fileObjectHandler.onDelete(iliasObject, user);
        }

        // Container object must also delete their children
        if (iliasObject.isContainer()) {
            const iliasObjects: Array<ILIASObject> = await this.getObjectData(iliasObject, user, false, true);
            for (const entry of iliasObjects) {
                await this.deleteObject(entry, user);
            }
        }
        await iliasObject.destroy();
    }
}
