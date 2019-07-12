var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/** angular */
import { Injectable } from "@angular/core";
import { Events, Platform } from "@ionic/angular";
/** ionic-native */
import { File } from "@ionic-native/file/ngx";
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
import { Logging } from "./logging/logging.service";
/** misc */
import { isNullOrUndefined } from "util";
var FileService = /** @class */ (function () {
    function FileService(events, platform, rest, translate, file, network) {
        this.events = events;
        this.platform = platform;
        this.rest = rest;
        this.translate = translate;
        this.file = file;
        this.network = network;
        this.log = Logging.getLogger(FileService_1.name);
    }
    FileService_1 = FileService;
    /**
     * Return the storage location to store files for the given user and object, depending on platform (iOS or Android)
     * @param user
     * @param iliasObject
     * @returns {string}
     */
    FileService.prototype.getStorageLocation = function (user, iliasObject) {
        if (this.platform.is("android")) {
            return this.file.externalApplicationStorageDirectory + "ilias-app/" + user.id + "/" + iliasObject.objId + "/";
        }
        else if (this.platform.is("ios")) {
            return "" + this.file.dataDirectory + user.id + "/" + iliasObject.objId + "/";
        }
        throw new IllegalStateError("Application must run on ios or android to determine the correct storage location.");
    };
    FileService.prototype.createDirectoryPath = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var basePath, resourcePath, pathShards, previousDir, _i, pathShards_1, shard;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        basePath = "";
                        if (this.platform.is("android")) {
                            basePath = this.file.externalApplicationStorageDirectory;
                        }
                        else if (this.platform.is("ios")) {
                            basePath = this.file.dataDirectory;
                        }
                        else
                            throw new IllegalStateError("Application must run on ios or android to determine the correct storage location.");
                        resourcePath = path.replace(basePath, "");
                        pathShards = resourcePath.split("/").filter(function (value) { return value !== ""; });
                        return [4 /*yield*/, this.file.resolveDirectoryUrl(basePath)];
                    case 1:
                        previousDir = _a.sent();
                        _i = 0, pathShards_1 = pathShards;
                        _a.label = 2;
                    case 2:
                        if (!(_i < pathShards_1.length)) return [3 /*break*/, 5];
                        shard = pathShards_1[_i];
                        return [4 /*yield*/, this.file.getDirectory(previousDir, shard, { create: true })];
                    case 3:
                        previousDir = _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Download the file from given file ILIAS Object
     * @param fileObject
     * @param forceDownload If set to true it will also download if you are NOT in WLAN
     * @returns {Promise<any>}
     */
    FileService.prototype.download = function (fileObject, forceDownload) {
        if (forceDownload === void 0) { forceDownload = false; }
        return __awaiter(this, void 0, void 0, function () {
            var user, settings, storageLocation, fileEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.find(fileObject.userId)];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, Settings.findByUserId(user.id)];
                    case 2:
                        settings = _a.sent();
                        // We don't want to download if we're not in wlan
                        if (forceDownload == false && settings.shouldntDownloadBecauseOfWLAN()) {
                            throw new NoWLANException("Unable to download file with refId " + fileObject.refId);
                        }
                        // If we have no file name we throw an error.
                        if (!fileObject.data.hasOwnProperty("fileName")) {
                            throw new Error("Metadata of file object is not present");
                        }
                        Log.write(this, "Resolving storage location");
                        storageLocation = this.getStorageLocation(user, fileObject);
                        return [4 /*yield*/, this.createDirectoryPath(storageLocation)];
                    case 3:
                        _a.sent();
                        // Provide a general listener that throws an event
                        Log.write(this, "start DL");
                        return [4 /*yield*/, this.rest.downloadFile(fileObject.refId, storageLocation, fileObject.data.fileName)];
                    case 4:
                        fileEntry = _a.sent();
                        Log.describe(this, "Download Complete: ", fileEntry);
                        return [4 /*yield*/, this.storeFileVersionLocal(fileObject)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, fileEntry];
                }
            });
        });
    };
    /**
     * Check if a local file exists for the given ILIAS file object. Resolves a promise with the corresponding FileEntry,
     * rejects the Promise if no file is existing.
     * @param fileObject
     * @returns {Promise<FileEntry>}
     */
    FileService.prototype.existsFile = function (fileObject) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            User.find(fileObject.userId).then(function (user) {
                var storageLocation = _this.getStorageLocation(user, fileObject);
                if (!window["resolveLocalFileSystemURL"]) {
                    Log.write(_this, "ResolveLocalFileSystemURL is not a function. You're probably not on a phone.");
                    reject(new Error("ResolveLocalFileSystemURL is not a function. You're probably not on a phone."));
                    return;
                }
                window["resolveLocalFileSystemURL"](storageLocation, function (dirEntry) {
                    if (fileObject.data.hasOwnProperty("fileName")) {
                        dirEntry.getFile(fileObject.data.fileName, { create: false }, function (fileEntry) {
                            resolve(fileEntry);
                        }, function (error) {
                            reject(error);
                        });
                    }
                    else {
                        reject(new Error("Metadata of file object is not present"));
                    }
                });
            }).catch(function (error) {
                Log.error(_this, error);
                reject(error);
            });
        });
    };
    /**
     * Deletes the local object on the device
     */
    FileService.prototype.removeObject = function (iliasObject) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(iliasObject.type === "file" || iliasObject.isLearnplace())) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.removeFile(iliasObject)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, iliasObject.setIsFavorite(0)];
                    case 3:
                        _a.sent();
                        iliasObject.isOfflineAvailable = false;
                        return [4 /*yield*/, iliasObject.save()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes the local file on the device from the given ILIAS file object
     * @param fileObject
     */
    FileService.prototype.removeFile = function (fileObject) {
        return __awaiter(this, void 0, void 0, function () {
            var user, storageLocation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fileObject.setIsFavorite(0)];
                    case 1:
                        _a.sent();
                        fileObject.isOfflineAvailable = false;
                        return [4 /*yield*/, fileObject.save()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, User.find(fileObject.userId)];
                    case 3:
                        user = _a.sent();
                        if (fileObject.isLearnplace()) {
                            //TODO lp await this.learnplaceManager.remove(fileObject.objId, fileObject.userId);
                            return [2 /*return*/];
                        }
                        if (!fileObject.data.hasOwnProperty("fileName")) return [3 /*break*/, 6];
                        storageLocation = this.getStorageLocation(user, fileObject);
                        // There's no local file to delete.
                        if (isNullOrUndefined(fileObject.data.fileVersionDateLocal))
                            return [2 /*return*/];
                        // We delete the file and save the metadata.
                        return [4 /*yield*/, this.file.removeFile(storageLocation, fileObject.data.fileName)];
                    case 4:
                        // We delete the file and save the metadata.
                        _a.sent();
                        return [4 /*yield*/, this.resetFileVersionLocal(fileObject)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6: throw new Error("Metadata of file object is not (fully) present");
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove all local files recursively under the given container ILIAS object
     * @param containerObject
     */
    FileService.prototype.removeRecursive = function (containerObject) {
        return __awaiter(this, void 0, void 0, function () {
            var iliasObjects, _i, iliasObjects_1, fileObject, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        this.log.trace(function () { return "Start recursive removal of files"; });
                        return [4 /*yield*/, ILIASObject.findByParentRefIdRecursive(containerObject.refId, containerObject.userId)];
                    case 1:
                        iliasObjects = _a.sent();
                        iliasObjects.push(containerObject);
                        _i = 0, iliasObjects_1 = iliasObjects;
                        _a.label = 2;
                    case 2:
                        if (!(_i < iliasObjects_1.length)) return [3 /*break*/, 5];
                        fileObject = iliasObjects_1[_i];
                        return [4 /*yield*/, this.removeObject(fileObject)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.log.info(function () { return "Deleting Files complete"; });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        this.log.error(function () { return "An error occurred while deleting recursive files: " + JSON.stringify(error_1); });
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tries to open the given file with an external application
     * @param fileObject
     * @returns {Promise<T>}
     */
    FileService.prototype.open = function (fileObject) {
        return __awaiter(this, void 0, void 0, function () {
            var fileEntry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.ready()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.existsFile(fileObject)];
                    case 2:
                        fileEntry = _a.sent();
                        return [2 /*return*/, this.openExisting(fileEntry, fileObject)];
                }
            });
        });
    };
    FileService.prototype.openExisting = function (fileEntry, fileObject) {
        if (this.platform.is("android")) {
            return this.openExistingAndroid(fileEntry, fileObject);
        }
        else {
            return this.openExistingIOS(fileEntry, fileObject);
        }
    };
    FileService.prototype.openExistingAndroid = function (fileEntry, fileObject) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.log.debug(function () { return "Opening file on Android: " + fileEntry.fullPath; });
                cordova.plugins["fileOpener2"].open(fileEntry.toURL(), fileObject.data.fileType, {
                    error: function (e) {
                        if (e.status == 9) {
                            _this.log.error(function () { return "Unable to open existing file on Android because the file type is not supported."; });
                            throw new CantOpenFileTypeException("Unable to open existing file on Android because the file type is not supported.");
                        }
                        else {
                            _this.log.error(function () { return "Unable to open existing file on Android with a general error."; });
                            throw e;
                        }
                    },
                    success: function () {
                        _this.log.trace(function () { return "Existing file successfully opened on Android."; });
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    FileService.prototype.openExistingIOS = function (fileEntry, fileObject) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.currentUser()];
                    case 1:
                        user = _a.sent();
                        this.log.debug(function () { return "Opening file on iOS: " + _this.getStorageLocation(user, fileObject) + fileObject.data.fileName; });
                        window["DocumentViewer"].previewFileFromUrlOrPath(function (msg) {
                            _this.log.trace(function () { return "Existing file successfully opened on iOS with message \"" + msg + "\""; });
                        }, function (msg) {
                            _this.log.error(function () { return "Unable to open existing file on iOS with message \"" + msg + "\""; });
                            throw new CantOpenFileTypeException("Unable to open existing file on iOS with message \"" + msg + "\"");
                        }, fileEntry.toURL());
                        return [2 /*return*/];
                }
            });
        });
    };
    //    User.c
    /**
     * Recursively calculates the used disk space by files under the given ilias Object - if they exist!.
     * Resolves a promise with the used disk space in bytes
     * @param iliasObject
     * @param inUse iff set to true only used up diskspace is shown, otherwise potentially needed disk space is calculated (not precise!)
     * @returns {Promise<number>}
     */
    FileService.calculateDiskSpace = function (iliasObject, inUse) {
        var _this = this;
        if (inUse === void 0) { inUse = true; }
        return new Promise(function (resolve, reject) {
            Log.describe(_this, "Calculating disk space for", iliasObject);
            ILIASObject.findByParentRefIdRecursive(iliasObject.refId, iliasObject.userId).then(function (iliasObjects) {
                var fileObjects = iliasObjects.filter(function (iliasObject) {
                    return iliasObject.type == "file";
                });
                var diskSpace = 0;
                fileObjects.forEach(function (fileObject) {
                    var metaData = fileObject.data;
                    if (metaData.hasOwnProperty("fileVersionDateLocal") && metaData.fileVersionDateLocal || !inUse && metaData) {
                        Log.describe(_this, "Found disk space usage: ", fileObject.data);
                        diskSpace += parseInt(metaData.fileSize);
                    }
                });
                resolve(diskSpace);
            }, function () {
                resolve(0);
            });
        });
    };
    /**
     * @param A
     * @param B
     * @returns {boolean}
     */
    FileService.isAOlderThanB = function (A, B) {
        return (Date.parse(B) > Date.parse(A));
    };
    /**
     * Set the fileVersionDateLocal to fileVersionDate from ILIAS
     * @param fileObject
     */
    FileService.prototype.storeFileVersionLocal = function (fileObject) {
        return new Promise(function (resolve, reject) {
            FileData.find(fileObject.id).then(function (fileData) {
                // First update the local file date.
                fileData.fileVersionDateLocal = fileData.fileVersionDate;
                fileData.save().then(function () {
                    //and update the metadata.
                    var metaData = fileObject.data;
                    metaData.fileVersionDateLocal = fileData.fileVersionDate;
                    fileObject.data = metaData;
                    // recursivly update the download state and resolve
                    fileObject.updateNeedsDownload().then(function () {
                        resolve(fileObject);
                    });
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    /**
     * Reset fileVersionDateLocal
     * @param fileObject
     */
    FileService.prototype.resetFileVersionLocal = function (fileObject) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            FileData.find(fileObject.id).then(function (fileData) {
                Log.write(_this, "File meta found.");
                // First update the local file date.
                fileData.fileVersionDateLocal = undefined;
                fileData.save().then(function () {
                    Log.write(_this, "file meta saved");
                    //and update the metadata.
                    var metaData = fileObject.data;
                    metaData.fileVersionDateLocal = undefined;
                    fileObject.data = metaData;
                    fileObject.save().then(function () {
                        // recursivly update the download state and resolve
                        fileObject.updateNeedsDownload().then(function () {
                            Log.write(_this, "File Metadata updated after deletion.");
                            resolve(fileObject);
                        });
                    });
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    /**
     * returns the online / offline status.
     * @returns {boolean}
     */
    FileService.prototype.isOffline = function () {
        return this.network.type == "none";
    };
    var FileService_1;
    FileService = FileService_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [Events,
            Platform,
            ILIASRestProvider,
            TranslateService,
            File,
            Network])
    ], FileService);
    return FileService;
}());
export { FileService };
//# sourceMappingURL=file.service.js.map