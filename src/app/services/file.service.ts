/** angular */
import { Injectable } from "@angular/core";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { Events, Platform } from "@ionic/angular";
/** ionic-native */
import { DirectoryEntry, File, FileEntry, FileError, Flags } from "@ionic-native/file/ngx";
import { TranslateService } from "@ngx-translate/core";
import { Network } from "@ionic-native/network/ngx";
/** models */
import { User } from "../models/user";
import { ILIASObject } from "../models/ilias-object";
import { ILIASRestProvider } from "../providers/ilias-rest.provider";
import { FileData } from "../models/file-data";
import { Log } from "./log.service";
import { Settings } from "../models/settings";
/** errors and exceptions */
import { IllegalStateError } from "../error/errors";
import { CantOpenFileTypeException } from "../exceptions/CantOpenFileTypeException";
import { NoWLANException } from "../exceptions/noWLANException";
/** logging */
import { Logger } from "./logging/logging.api";
import { Logging } from "./logging/logging.service";
/** misc */
import { isNullOrUndefined } from "../util/util.function";
import { AuthenticationProvider } from "../providers/authentication.provider";
import { UserStorageMamager, StorageUtilization } from "./filesystem/user-storage.mamager";

export interface DownloadProgress {
    fileObject: ILIASObject;
    loaded: number;
    total: number;
    percentCompleted: number;
}

@Injectable({
    providedIn: "root"
})
export class FileService implements StorageUtilization {

    private log: Logger = Logging.getLogger(FileService.name);

    constructor(
        protected events: Events,
        protected platform: Platform,
        protected rest: ILIASRestProvider,
        protected translate: TranslateService,
        private readonly file: File,
        private readonly network: Network,
        private readonly userStorageManager: UserStorageMamager,
        private readonly fileOpener: FileOpener,
    ) {
    }

    /**
     * Return the storage location to store files for the given user and object, depending on platform (iOS or Android)
     * @param user
     * @param iliasObject
     * @returns {string}
     */
    getStorageLocation(user: User, iliasObject: ILIASObject): string {
        if (this.platform.is("android")) {
            return `${this.file.externalApplicationStorageDirectory}ilias-app/${user.id}/${iliasObject.objId}/`;
        } else if (this.platform.is("ios")) {
            return `${this.file.dataDirectory}${user.id}/${iliasObject.objId}/`;
        }

        throw new IllegalStateError("Application must run on ios or android to determine the correct storage location.");
    }

    private async createDirectoryPath(path: string): Promise<void> {
        let basePath: string = "";
        if (this.platform.is("android")) {
            basePath = this.file.externalApplicationStorageDirectory;
        } else if (this.platform.is("ios")) {
            basePath = this.file.dataDirectory;
        } else throw new IllegalStateError("Application must run on ios or android to determine the correct storage location.");

        const resourcePath: string = path.replace(basePath, "");
        const pathShards: Array<string> = resourcePath.split("/").filter((value) => value !== "");

        let previousDir: DirectoryEntry = await this.file.resolveDirectoryUrl(basePath);
        for (const shard of pathShards) {
            previousDir = await this.file.getDirectory(previousDir, shard, <Flags>{create: true});
        }
    }


    /**
     * Download the file from given file ILIAS Object
     * @param fileObject
     * @param forceDownload If set to true it will also download if you are NOT in WLAN
     * @returns {Promise<any>}
     */
    async download(fileObject: ILIASObject, forceDownload: boolean = false): Promise<FileEntry> {
        this.log.debug(() => `Download file with object id: ${fileObject.objId}, refId: ${fileObject.refId}, for user: ${fileObject.userId}`);
        const user: User = await User.find(fileObject.userId);
        const settings: Settings = await Settings.findByUserId(user.id);

        // We don't want to download if we're not in wlan
        if (forceDownload == false && settings.shouldntDownloadBecauseOfWLAN()) {
            throw new NoWLANException(`Unable to download file with refId ${fileObject.refId}`);
        }

        // If we have no file name we throw an error.
        if (!fileObject.data.hasOwnProperty("fileName")) {
            throw new Error("Metadata of file object is not present");
        }

        this.log.debug(() => "Resolving storage location");
        const storageLocation: string = this.getStorageLocation(user, fileObject);
        await this.createDirectoryPath(storageLocation);

        // Provide a general listener that throws an event
        this.log.debug(() => "Start Download");
        const fileEntry: FileEntry = await this.rest.downloadFile(fileObject.refId, storageLocation, fileObject.data.fileName);
        this.log.debug(() => `Download Complete: ${fileEntry.fullPath}`);

        fileObject.needsDownload = false;
        await this.storeFileVersionLocal(fileObject);
        this.log.debug(() => `File metadata update complete, file version local: ${fileObject.data.fileVersionDateLocal}`);

        await this.userStorageManager.addObjectToUserStorage(fileObject.userId, fileObject.objId, this);
        this.log.debug(() => "User storage space calculation complete");

        return fileEntry;
    }

    /**
     * Check if a local file exists for the given ILIAS file object. Resolves a promise with the corresponding FileEntry,
     * rejects the Promise if no file is existing.
     * @param fileObject
     * @returns {Promise<FileEntry>}
     */
    existsFile(fileObject: ILIASObject): Promise<FileEntry> {
        return new Promise((resolve: any, reject: (error: FileError | Error) => void): void => {
            User.find(fileObject.userId).then(user => {
                const storageLocation: string = this.getStorageLocation(user, fileObject);
                if (!window["resolveLocalFileSystemURL"]) {
                    Log.write(this, "ResolveLocalFileSystemURL is not a function. You're probably not on a phone.");
                    reject(new Error("ResolveLocalFileSystemURL is not a function. You're probably not on a phone."));
                    return;
                }
                window["resolveLocalFileSystemURL"](storageLocation, (dirEntry: DirectoryEntry) => {
                    if (fileObject.data.hasOwnProperty("fileName")) {
                        dirEntry.getFile(fileObject.data.fileName, {create: false}, (fileEntry) => {
                            resolve(fileEntry);
                        }, (error) => {
                            reject(error);
                        });
                    } else {
                        reject(new Error("Metadata of file object is not present"));
                    }
                });
            }).catch(error => {
                Log.error(this, error);
                reject(error);
            });
        });
    }

    /**
     * Deletes the local object on the device
     */
    async removeObject(iliasObject: ILIASObject): Promise<void> {
        if (
            iliasObject.type === "file" ||
            iliasObject.isLearnplace() ||
            iliasObject.type === "htlm" ||
            iliasObject.type === "sahs"
        ) {
            await this.removeFile(iliasObject);
            return;
        }

        await iliasObject.setIsFavorite(0);
        await iliasObject.save();
    }


    /**
     * Deletes the local file on the device from the given ILIAS file object
     * @param fileObject
     */
    async removeFile(fileObject: ILIASObject): Promise<void> {
        await fileObject.setIsFavorite(0);
        await fileObject.save();

        const user: User = await User.find(fileObject.userId);
        if (fileObject.data.hasOwnProperty("fileName")) {
            const storageLocation: string = this.getStorageLocation(user, fileObject);

            // There's no local file to delete.
            if (isNullOrUndefined(fileObject.data.fileVersionDateLocal)) {
                this.log.debug(() => `Skip removal of file with objId: ${fileObject.objId}, no local file version date present`);
                return;
            }

            await this.userStorageManager.removeObjectFromUserStorage(fileObject.userId, fileObject.objId, this);

            // We delete the file and save the metadata.
            // await this.file.removeFile(storageLocation, fileObject.data.fileName);
            const basePath: Array<string> = storageLocation.split("/");

            // Remove trailing slash
            if (basePath[basePath.length - 1].length === 0) {
                basePath.pop();
            }

            // Remove parent dir
            basePath.pop();

            const targetPath: string = basePath.join("/");
            this.log.debug(() => `Delete dir: ${fileObject}, in path: "${targetPath}"`);
            await this.file.removeRecursively(targetPath, `${fileObject.objId}/`);

            fileObject.needsDownload = true;
            await this.resetFileVersionLocal(fileObject);

        } else {
            throw new Error("Metadata of file object is not (fully) present");
        }
    }

    /**
     * Tries to open the given file with an external application
     * @param fileObject
     * @returns {Promise<T>}
     */
    async open(fileObject: ILIASObject): Promise<void> {
        await this.platform.ready();
        const fileEntry: FileEntry = await this.existsFile(fileObject);
        await this.openExisting(fileEntry, fileObject);

        // update the learning progress
        const fd: FileData = await FileData.find(fileObject.id);
        fd.fileLearningProgressPushToServer = !fd.fileLearningProgress;
        await fd.save();
    }

    private async openExisting(fileEntry: FileEntry, fileObject: ILIASObject): Promise<void> {
        try {
            this.log.debug(() => `Opening file: ${fileEntry.fullPath}`);
            await this.fileOpener.open(
                fileEntry.toURL(),
                fileObject.data.fileType
            );
            this.log.trace(() => "Existing file successfully opened.");
        } catch (error) {
            if (error.status == 9) {
                this.log.error(() => "Unable to open existing file because the file type is not supported.");
                throw new CantOpenFileTypeException("Unable to open existing file because the file type is not supported.");
            } else {
                this.log.error(() => "Unable to open existing file with a general error.");
                throw error;
            }
        }
    }

    /**
     * Recursively calculates the used disk space by files under the given ilias Object - if they exist!.
     * Resolves a promise with the used disk space in bytes
     * @param iliasObject
     * @param inUse iff set to true only used up diskspace is shown, otherwise potentially needed disk space is calculated (not precise!)
     * @returns {Promise<number>}
     */
    static calculateDiskSpace(iliasObject: ILIASObject, inUse: boolean = true): Promise<number> {
        return new Promise((resolve, reject) => {
            Log.describe(this, "Calculating disk space for", iliasObject);
            ILIASObject.findByParentRefIdRecursive(iliasObject.refId, iliasObject.userId).then(iliasObjects => {
                const fileObjects: Array<ILIASObject> = iliasObjects.filter(iliasObject => {
                    return iliasObject.type == "file";
                });
                let diskSpace: number = 0;
                fileObjects.forEach(fileObject => {

                    const metaData = fileObject.data;
                    if (metaData.hasOwnProperty("fileVersionDateLocal") && metaData.fileVersionDateLocal || !inUse && metaData) {
                        Log.describe(this, "Found disk space usage: ", fileObject.data);

                        diskSpace += parseInt(metaData.fileSize);
                    }
                });
                resolve(diskSpace);
            }, () => {
                resolve(0);
            });
        });
    }

    async getUsedStorage(objectId: number, userId: number): Promise<number> {
        const io: ILIASObject = await ILIASObject.findByObjIdAndUserId(objectId, userId);
        if (typeof io.data.fileSize === "string") {
            return Number.parseInt(io.data.fileSize, 10);
        }

        if (typeof io.data.fileSize === "number") {
            return io.data.fileSize;
        }

        this.log.warn(() => `Unable to calculate filesize of object: ${objectId} owned by user: ${userId}`);
        return 0;
    }

    /**
     * Set the fileVersionDateLocal to fileVersionDate from ILIAS
     * @param fileObject
     */
    private async storeFileVersionLocal(fileObject: ILIASObject): Promise<ILIASObject> {
        const fileData: FileData = await FileData.find(fileObject.id);

        // First update the local file date.
        fileData.fileVersionDateLocal = fileData.fileVersionDate;
        await fileData.save();

        //and update the metadata.
        const metaData = fileObject.data;
        metaData.fileVersionDateLocal = fileData.fileVersionDate;
        fileObject.data = metaData;
        await fileObject.save();

        // recursively update the download state and resolve
        await fileObject.updateNeedsDownload();
        return fileObject;
    }

    /**
     * Reset fileVersionDateLocal
     * @param fileObject
     */
    private async resetFileVersionLocal(fileObject: ILIASObject): Promise<ILIASObject> {
        const fileData: FileData = await FileData.find(fileObject.id);

        this.log.debug(() => "File meta found.");

        // First update the local file date.
        fileData.fileVersionDateLocal = undefined;
        await fileData.save();
        this.log.debug(() => "file meta saved");

        //and update the metadata.
        const metaData = fileObject.data;
        metaData.fileVersionDateLocal = undefined;
        fileObject.data = metaData;
        await fileObject.save();

        // recursively update the download state and resolve
        await fileObject.updateNeedsDownload();
        this.log.debug(() => "File Metadata updated after deletion.");

        return fileObject;
    }

    /**
     * Invokes rest-method that posts learning-progress-to-done
     * @param unsynced
     */
    async postLearningProgressDone(unsynced: Array<FileData>): Promise<void> {
        for (let i: number = 0; i < unsynced.length; i++) {
            const fd: FileData = unsynced[i];
            const io: ILIASObject = await ILIASObject.find(fd.iliasObjectId);
            await this.rest.postLearningProgressDone(io.refId);
            fd.fileLearningProgressPushToServer = false;
            await fd.save();
        }
    }


    /**
     * returns the online / offline status.
     * @returns {boolean}
     */
    isOffline(): boolean {
        return this.network.type == "none";
    }
}
