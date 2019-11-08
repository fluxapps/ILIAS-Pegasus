/** angular */
import {Injectable, Inject} from "@angular/core";
import {Events, Platform} from "@ionic/angular";
/** ionic-native */
import {DirectoryEntry, File, FileEntry, FileError, Flags} from "@ionic-native/file/ngx";
import {TranslateService} from "@ngx-translate/core";
import {Network} from "@ionic-native/network/ngx";
/** models */
import {User} from "../models/user";
import {ILIASObject} from "../models/ilias-object";
import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {FileData} from "../models/file-data";
import {Log} from "./log.service";
import {Settings} from "../models/settings";
/** errors and exceptions */
import {IllegalStateError} from "../error/errors";
import {CantOpenFileTypeException} from "../exceptions/CantOpenFileTypeException";
import {NoWLANException} from "../exceptions/noWLANException";
/** logging */
import {Logger} from "./logging/logging.api";
import {Logging} from "./logging/logging.service";
/** misc */
import {isNullOrUndefined} from "../util/util.function";
import {AuthenticationProvider} from "../providers/authentification/authentication.provider";
import {LEARNPLACE_MANAGER, LearnplaceManager} from "../learnplace/services/learnplace.management";

export interface DownloadProgress {
    fileObject: ILIASObject;
    loaded: number;
    total: number;
    percentCompleted: number;
}

@Injectable({
    providedIn: "root"
})
export class FileService {

    private log: Logger = Logging.getLogger(FileService.name);

    constructor(
        protected events: Events,
        protected platform: Platform,
        protected rest: ILIASRestProvider,
        protected translate: TranslateService,
        private readonly file: File,
        private readonly network: Network,
        @Inject(LEARNPLACE_MANAGER) private readonly learnplaceManager: LearnplaceManager
    ) {}


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
        }
        else throw new IllegalStateError("Application must run on ios or android to determine the correct storage location.");

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

        Log.write(this, "Resolving storage location");
        const storageLocation: string = this.getStorageLocation(user, fileObject);
        await this.createDirectoryPath(storageLocation);

        // Provide a general listener that throws an event
        Log.write(this, "start DL");
        const fileEntry: FileEntry = await this.rest.downloadFile(fileObject.refId, storageLocation, fileObject.data.fileName);
        Log.describe(this, "Download Complete: ", fileEntry);
        await this.storeFileVersionLocal(fileObject);
        return fileEntry;
    }

    /**
     * Check if a local file exists for the given ILIAS file object. Resolves a promise with the corresponding FileEntry,
     * rejects the Promise if no file is existing.
     * @param fileObject
     * @returns {Promise<FileEntry>}
     */
    existsFile(fileObject: ILIASObject): Promise<FileEntry> {
        return new Promise((resolve: any, reject: (error: FileError|Error) => void): void => {
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
        if(iliasObject.type === "file" || iliasObject.isLearnplace()) {
            await this.removeFile(iliasObject);
            return;
        }

        await iliasObject.setIsFavorite(0);
        iliasObject.isOfflineAvailable = false;
        await iliasObject.save();
    }


    /**
     * Deletes the local file on the device from the given ILIAS file object
     * @param fileObject
     */
    async removeFile(fileObject: ILIASObject): Promise<void> {
        await fileObject.setIsFavorite(0);
        fileObject.isOfflineAvailable = false;
        await fileObject.save();

        const user: User = await User.find(fileObject.userId);
        if(fileObject.isLearnplace()) {
            await this.learnplaceManager.remove(fileObject.objId, fileObject.userId);
            return;
        }
        if (fileObject.data.hasOwnProperty("fileName")) {
          const storageLocation: string = this.getStorageLocation(user, fileObject);

          // There's no local file to delete.
          if(isNullOrUndefined(fileObject.data.fileVersionDateLocal))
            return;

          // We delete the file and save the metadata.
          await this.file.removeFile(storageLocation, fileObject.data.fileName);
          await this.resetFileVersionLocal(fileObject);

        } else {
          throw new Error("Metadata of file object is not (fully) present");
        }
    }

    /**
     * Remove all local files recursively under the given container ILIAS object
     * @param containerObject
     */
    async removeRecursive(containerObject: ILIASObject): Promise<void> {

        try {
          this.log.trace(() => "Start recursive removal of files");
          const iliasObjects: Array<ILIASObject> = await ILIASObject.findByParentRefIdRecursive(containerObject.refId, containerObject.userId);
          iliasObjects.push(containerObject);

          for(const fileObject of iliasObjects)
              await this.removeObject(fileObject);
          this.log.info(() => "Deleting Files complete");
        }
        catch (error) {
          this.log.error(() => `An error occurred while deleting recursive files: ${JSON.stringify(error)}`);
          throw error;
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

    private openExisting(fileEntry: FileEntry, fileObject: ILIASObject): Promise<void> {
        if (this.platform.is("android")) {
            return this.openExistingAndroid(fileEntry, fileObject);
        } else {
            return this.openExistingIOS(fileEntry, fileObject);
        }
    }

    private async openExistingAndroid(fileEntry: FileEntry, fileObject: ILIASObject): Promise<void> {
      this.log.debug(() => `Opening file on Android: ${fileEntry.fullPath}`);
      cordova.plugins["fileOpener2"].open(
        fileEntry.toURL(),
        fileObject.data.fileType,
        {
          error: (e): void => {
            if (e.status == 9) {
              this.log.error(() => "Unable to open existing file on Android because the file type is not supported.");
              throw new CantOpenFileTypeException("Unable to open existing file on Android because the file type is not supported.");
            }
          else {
              this.log.error(() => "Unable to open existing file on Android with a general error.");
              throw e;
            }
          },
          success: (): void => {
            this.log.trace(() => "Existing file successfully opened on Android.");
          }
        }
      );
    }

    private async openExistingIOS(fileEntry: FileEntry, fileObject: ILIASObject): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        this.log.debug(() => `Opening file on iOS: ${this.getStorageLocation(user, fileObject)}${fileObject.data.fileName}`);

      window["DocumentViewer"].previewFileFromUrlOrPath(
          (msg) => {
            this.log.trace(() => `Existing file successfully opened on iOS with message "${msg}"`);
          },
          (msg) => {
            this.log.error(() => `Unable to open existing file on iOS with message "${msg}"`);
            throw new CantOpenFileTypeException(`Unable to open existing file on iOS with message "${msg}"`);
          },
          fileEntry.toURL()
        );
    }

//    User.c
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

    /**
     * @param A
     * @param B
     * @returns {boolean}
     */
    static isAOlderThanB(A: string, B: string): boolean {
        return (Date.parse(B) > Date.parse(A));
    }

    /**
     * Set the fileVersionDateLocal to fileVersionDate from ILIAS
     * @param fileObject
     */
    private storeFileVersionLocal(fileObject: ILIASObject): Promise<ILIASObject> {
        return new Promise((resolve, reject) => {
            FileData.find(fileObject.id).then(fileData => {
                // First update the local file date.
                fileData.fileVersionDateLocal = fileData.fileVersionDate;
                fileData.save().then(() => {
                    //and update the metadata.
                    const metaData = fileObject.data;
                    metaData.fileVersionDateLocal = fileData.fileVersionDate;
                    fileObject.data = metaData;

                    // recursivly update the download state and resolve
                    fileObject.updateNeedsDownload().then(() => {
                        resolve(fileObject);
                    });
                });
            }).catch(error => {
                reject(error);
            });
        });
    }

    /**
     * Reset fileVersionDateLocal
     * @param fileObject
     */
    private resetFileVersionLocal(fileObject: ILIASObject): Promise<ILIASObject> {
        return new Promise((resolve, reject) => {
            FileData.find(fileObject.id).then(fileData => {
                Log.write(this, "File meta found.");
                // First update the local file date.
                fileData.fileVersionDateLocal = undefined;
                fileData.save().then(() => {
                    Log.write(this, "file meta saved");
                    //and update the metadata.
                    const metaData = fileObject.data;
                    metaData.fileVersionDateLocal = undefined;
                    fileObject.data = metaData;
                    fileObject.save().then(() => {
                        // recursivly update the download state and resolve
                        fileObject.updateNeedsDownload().then(() => {
                            Log.write(this, "File Metadata updated after deletion.");
                            resolve(fileObject);
                        });
                    });
                });

            }).catch(error => {
                reject(error);
            });
        });
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
