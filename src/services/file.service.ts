import {Injectable} from "@angular/core";
import {Events, Platform} from "ionic-angular";
import {IllegalStateError} from "../error/errors";
import {User} from "../models/user";
import {ILIASObject} from "../models/ilias-object";
import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {File} from "@ionic-native/file";
import {FileData} from "../models/file-data";
import {FooterToolbarService} from "./footer-toolbar.service";
import {Log} from "./log.service";
import {TranslateService} from "ng2-translate/src/translate.service";
import {Settings} from "../models/settings";
import {Job} from "./footer-toolbar.service";
import {CantOpenFileTypeException} from "../exceptions/CantOpenFileTypeException";
import {NoWLANException} from "../exceptions/noWLANException";
import {Network} from "@ionic-native/network"

export interface DownloadProgress {
    fileObject: ILIASObject;
    loaded: number;
    total: number;
    percentCompleted: number;
}

@Injectable()
export class FileService {

    constructor(protected events: Events,
                       protected platform: Platform,
                       protected rest: ILIASRestProvider,
                       protected footerToolbar: FooterToolbarService,
                       protected translate: TranslateService,
                       private readonly file: File,
                       private readonly network: Network) {
    }


    /**
     * Return the storage location to store files for the given user and object, depending on platform (iOS or Android)
     * @param user
     * @param iliasObject
     * @returns {string}
     */
     getStorageLocation(user: User, iliasObject: ILIASObject): string {
        if (this.platform.is("android")) {
            return `${window["cordova"].file.externalApplicationStorageDirectory}ilias-app/${user.id}/${iliasObject.objId}/`;
        } else if (this.platform.is("ios")) {
            return `${window["cordova"].file.dataDirectory}${user.id}/${iliasObject.objId}/`;
        }

        throw new IllegalStateError("Application must run on ios or android to determine the correct storage location.");
    }


    /**
     * Download the file from given file ILIAS Object
     * @param fileObject
     * @param forceDownload If set to true it will also download if you are NOT in WLAN
     * @returns {Promise<any>}
     */
    download(fileObject: ILIASObject, forceDownload: boolean = false) {

        let user;

        return User.find(fileObject.userId)
            .then(aUser => {
                user = aUser;
                return Settings.findByUserId(user.id);
            }).then(settings => {

                // We don't want to download if we're not in wlan
                if (forceDownload == false && settings.shouldntDownloadBecauseOfWLAN()) {
                    return Promise.reject(new NoWLANException());
                }

                // If we have no file name we throw an error.
                if (!fileObject.data.hasOwnProperty("fileName")) {
                    return Promise.reject(new Error("Metadata of file object is not present"));
                }

                Log.write(this, "Resolving storage location");
                const storageLocation = this.getStorageLocation(user, fileObject);

                // Provide a general listener that throws an event
                Log.write(this, "start DL");
                let fileEntry;
                return this.rest.downloadFile(fileObject.refId, storageLocation, fileObject.data.fileName)
                    .then(aFileEntry => {
                        Log.describe(this, "Download Complete: ", fileEntry);
                        fileEntry = aFileEntry;
                        return this.storeFileVersionLocal(fileObject);
                    }).then(() => Promise.resolve(fileEntry));

            });
    }

    /**
     * Check if a local file exists for the given ILIAS file object. Resolves a promise with the corresponding FileEntry,
     * rejects the Promise if no file is existing.
     * @param fileObject
     * @returns {Promise<FileEntry>}
     */
    existsFile(fileObject: ILIASObject) {
        return new Promise((resolve, reject) => {
            User.find(fileObject.userId).then(user => {
                const storageLocation = this.getStorageLocation(user, fileObject);
                if (!window["resolveLocalFileSystemURL"]) {
                    Log.write(this, "ResolveLocalFileSystemURL is not a function. You're probably not on a phone.");
                    reject("ResolveLocalFileSystemURL is not a function. You're probably not on a phone.");
                    return;
                }
                window["resolveLocalFileSystemURL"](storageLocation, (dirEntry) => {
                    if (fileObject.data.hasOwnProperty("fileName")) {
                        dirEntry.getFile(fileObject.data.fileName, {create: false}, (fileEntry) => {
                            resolve(fileEntry);
                        }, (error) => {
                            reject();
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
     * Deletes the local file on the device from the given ILIAS file object
     * @param fileObject
     */
    remove(fileObject: ILIASObject): Promise<void> {
        return User.find(fileObject.userId).then(user => {
            if (fileObject.data.hasOwnProperty("fileName") && fileObject.data.hasOwnProperty("fileVersionDateLocal")) {
                const storageLocation = this.getStorageLocation(user, fileObject);

                // There's no local file to delete.
                if(fileObject.data.fileVersionDateLocal == undefined)
                    return Promise.resolve();

                // We delete the file and save the metadata.
                return Promise.all([
                    this.file.removeFile(storageLocation, fileObject.data.fileName),
                    this.resetFileVersionLocal(fileObject)
                ]).then(() => Promise.resolve());

            } else {
                return Promise.reject(new Error("Metadata of file object is not (fully) present"));
            }
        });
    }

    /**
     * Remove all local files recursively under the given container ILIAS object
     * @param containerObject
     */
    removeRecursive(containerObject: ILIASObject): Promise<any> {
            this.footerToolbar.addJob(Job.DeleteFilesTree, this.translate.instant("deleting_files"));
            return ILIASObject.findByParentRefIdRecursive(containerObject.refId, containerObject.userId).then(iliasObjects => {
                iliasObjects.push(containerObject);
                const fileObjects = iliasObjects.filter(iliasObject => {
                    return iliasObject.type == "file";
                });
                const promises = [];
                fileObjects.forEach(fileObject => {
                    promises.push(this.remove(fileObject));
                });

                return Promise.all(promises);
            }).then(() => {
                Log.write(this, "Deleting Files complete");
                this.footerToolbar.removeJob(Job.DeleteFilesTree);
                return Promise.resolve();
            }).catch((error) => {
                Log.error(this, error)
                this.footerToolbar.removeJob(Job.DeleteFilesTree);
                return Promise.reject(error);
            });
    }

    /**
     * Recursive function that will remove all fileObjects given.
     * @param fileObjects
     * @returns {any}
     */
    protected removeAll(fileObjects: Array<ILIASObject>): Promise<any> {
        if (fileObjects.length == 0)
            return Promise.resolve();

        const object = fileObjects.pop();
        return this.remove(object)
            .then(() => this.removeAll(fileObjects));
    }


    /**
     * Tries to open the given file with an external application
     * @param fileObject
     * @returns {Promise<T>}
     */
    open(fileObject: ILIASObject): Promise<any> {
        return this.platform.ready()
            .then(() => this.existsFile(fileObject))
            .then(fileEntry => this.openExisting(fileEntry, fileObject));
    }

    protected openExisting(fileEntry, fileObject): Promise<any> {
        if (this.platform.is("android")) {
            return this.openExistingAndroid(fileEntry, fileObject);
        } else {
            return this.openExistingIOS(fileEntry, fileObject);
        }
    }

    protected openExistingAndroid(fileEntry, fileObject): Promise<any> {
        return new Promise((resolve, reject) => {
            Log.write(this, "Opening a file...");
            window["cordova"].plugins.fileOpener2.open(
                fileEntry.toURL(),
                fileObject.data.fileType,
                {
                    error: function(e) {
                        if (e.status == 9)
                            reject(new CantOpenFileTypeException());
                        else
                            reject(e);
                    },
                    success: function() {
                        //Log.write(this, "File opened!");
                        resolve();
                    }
                }
            );
        });
    }

    protected openExistingIOS(fileEntry, fileObject) {
        const handler = <any> window;
        return User.currentUser().then(user => {
            return new Promise((resolve, reject) => {
                Log.write(this, "opening: " + this.getStorageLocation(user, fileObject) + fileObject.data.fileName);
                handler.handleDocumentWithURL(
                    function(msg) {
                        Log.write(this, "success: " + msg)
                        resolve();
                    },
                    function(msg) {
                        Log.write(this, "error: " + msg)
                        reject(new CantOpenFileTypeException());
                    },
                    fileEntry.toURL()
                );
            });
        });
    }

//    User.c
    /**
     * Recursively calculates the used disk space by files under the given ilias Object - if they exist!.
     * Resolves a promise with the used disk space in bytes
     * @param iliasObject
     * @param inUse iff set to true only used up diskspace is shown, otherwise potentially needed disk space is calculated (not precise!)
     * @returns {Promise<number>}
     */
    static calculateDiskSpace(iliasObject: ILIASObject, inUse = true): Promise<number> {
        return new Promise((resolve, reject) => {
            Log.describe(this, "Calculating disk space for", iliasObject);
            ILIASObject.findByParentRefIdRecursive(iliasObject.refId, iliasObject.userId).then(iliasObjects => {
                const fileObjects = iliasObjects.filter(iliasObject => {
                    return iliasObject.type == "file";
                });
                let diskSpace = 0;
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
    static isAOlderThanB(A: string, B: string) {
        return (Date.parse(B) > Date.parse(A));
    }

    /**
     * Set the fileVersionDateLocal to fileVersionDate from ILIAS
     * @param fileObject
     */
    protected storeFileVersionLocal(fileObject: ILIASObject): Promise<ILIASObject> {
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
    protected resetFileVersionLocal(fileObject: ILIASObject): Promise<ILIASObject> {
        return new Promise((resolve, reject) => {
            FileData.find(fileObject.id).then(fileData => {
                Log.write(this, "File meta found.")
                // First update the local file date.
                fileData.fileVersionDateLocal = null;
                fileData.save().then(() => {
                    Log.write(this, "file meta saved")
                    //and update the metadata.
                    const metaData = fileObject.data;
                    metaData.fileVersionDateLocal = null;
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
     * returns the online / offline status.
     * @returns {boolean}
     */
    isOffline(): boolean {
        return this.network.type == "none";
    }
}
