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

export interface GetObjectDataOptions {
    parentObject: ILIASObject,
    user: User,
    recursive: boolean,
    refreshFiles: boolean,
    downloadMetadata: boolean
}

@Injectable({
    providedIn: "root"
})
export class DataProvider {

    private readonly log: Logger = Logging.getLogger("DataProvider");

    private readonly runningDownloadTasks: Map<number, Promise<Array<ILIASObject>>> = new Map<number, Promise<Array<ILIASObject>>>();

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
    async getDesktopData(user: User): Promise<Array<ILIASObject>> {
        const localDesktopItems: Array<ILIASObject> = await DesktopItem.findByUserId(user.id);
        const refId: number = -2;

        // Wait for download if we have no local data
        if (localDesktopItems.length === 0) {
            this.log.debug(() => "No local desktop data found wait for object metadata download");
            const objects: Array<ILIASObject> =  await this.loadRemoteDesktopData(user);
            return objects.sort(ILIASObject.compare);
        } else {
            // Schedule download and return local data, if task is not already running
            if (!this.runningDownloadTasks.has(refId)) {
                this.log.debug(() => "Local data desktop available refresh data in background task");

                // Download task
                const task: Promise<Array<ILIASObject>> = this.loadRemoteDesktopData(user);

                // Add running task to list because we dont want to execute it twice
                this.runningDownloadTasks.set(refId, task);

                // Remove task after we are done
                task
                    .then(() => this.runningDownloadTasks.delete(refId))
                    .then(() => this.log.debug(() => "Background task -> desktop object data fetch complete"))
                    .catch((error) => {
                        this.runningDownloadTasks.delete(refId);
                        this.log.error(() => `Background task -> desktop object data fetch failed with message: "${error.message}"`);
                        throw error;
                    });
            } else {
                this.log.debug(() => "Background task for desktop object data fetch already running");
            }

            this.log.debug(() => "Return local desktop object data");
            return localDesktopItems.sort(ILIASObject.compare);
        }
    }


    /**
     * Fetch and store ILIAS objects under the given parent ref-ID
     *
     * @param options
     * @returns {Promise<ILIASObject[]>}
     */
    async getObjectData(options: GetObjectDataOptions): Promise<Array<ILIASObject>> {
        this.log.debug(() => "Fetch object data")
        // Fetch local data
        const localObjects: Array<ILIASObject> = options.recursive ?
            await ILIASObject.findByParentRefIdRecursive(options.parentObject.refId, options.user.id) :
            await ILIASObject.findByParentRefId(options.parentObject.refId, options.user.id);

        if (options.downloadMetadata) {
            // Wait for download if we have no local data
            if (localObjects.length === 0) {
                this.log.debug(() => "No local data found wait for object metadata download");
                const objects: Array<ILIASObject> = await this.loadRemoteData(options);
                return objects.sort(ILIASObject.compare);
            } else {
                // Schedule download and return local data, if task is not already running
                if (!this.runningDownloadTasks.has(options.parentObject.refId)) {
                    this.log.debug(() => "Local data available refresh data in background task");

                    // Download task
                    const task: Promise<Array<ILIASObject>> = this.loadRemoteData(options);

                    // Add running task to list because we dont want to execute it twice
                    this.runningDownloadTasks.set(options.parentObject.refId, task);

                    // Remove task after we are done
                    task
                        .then(() => this.runningDownloadTasks.delete(options.parentObject.refId))
                        .then(() => this.log.debug(() => "Background task -> object data fetch complete"))
                        .catch((error) => {
                            this.runningDownloadTasks.delete(options.parentObject.refId);
                            this.log.error(() => `Background task -> object data fetch failed with message: "${error.message}"`);
                            throw error;
                        });
                } else {
                    this.log.debug(() => "Background task for object data fetch already running");
                }

                this.log.debug(() => "Return local object data");
                return localObjects.sort(ILIASObject.compare);
            }
        }

        return localObjects.sort(ILIASObject.compare);
    }

    private async loadRemoteData(options: GetObjectDataOptions): Promise<Array<ILIASObject>> {
        const data: Array<DesktopData> = await this.rest.getObjectData(options.parentObject.refId, options.user, options.recursive);
        return this.storeILIASObjects(data, options.user, options.parentObject, options.recursive, options.refreshFiles);
    }

    private async loadRemoteDesktopData(user: User): Promise<Array<ILIASObject>> {
        const data: Array<DesktopData> = await this.rest.getDesktopData(user);
        return this.storeILIASDesktopObjects(data, user);
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
        this.log.trace(() => `Storing ILIAS Object with objId: ${object.objId} and refId: ${object.refId}`);

        const iliasObject: ILIASObject = await ILIASObject.findByRefIdAndUserId(parseInt(object.refId, 10), user.id);
        iliasObject.readFromObject(object);

        const parent: ILIASObject = await iliasObject.parent;
        if (iliasObject.id == 0 && parent !== undefined) {
            iliasObject.isNew = true;
        }
        await iliasObject.save();

        if (iliasObject.type === "file") {
            if (refreshFiles) {
                return this.onSaveFile(user, iliasObject);
            }
            else {
                return iliasObject.save();
            }
        } else {
            return iliasObject;
        }
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
    private async storeILIASObjects(remoteObjects: Array<DesktopData>, user: User, parentObject: ILIASObject, recursive: boolean = false, refreshFiles: boolean = true): Promise<Array<ILIASObject>> {
        if (recursive) {
            const existingObjects: Array<ILIASObject> = await ILIASObject.findByParentRefIdRecursive(parentObject.refId, user.id);
                return this.saveOrDeleteObjects(remoteObjects, existingObjects, user, parentObject, refreshFiles);
        } else {
            const existingObjects: Array<ILIASObject> = await ILIASObject.findByParentRefId(parentObject.refId, user.id);
            return this.saveOrDeleteObjects(remoteObjects, existingObjects, user, parentObject, refreshFiles);
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
            const iliasObjects: Array<ILIASObject> = await this.getObjectData({
                parentObject: iliasObject,
                user,
                recursive: false,
                refreshFiles: true,
                downloadMetadata: false
            });
            for (const entry of iliasObjects) {
                await this.deleteObject(entry, user);
            }
        }
        await iliasObject.destroy();
    }
}
