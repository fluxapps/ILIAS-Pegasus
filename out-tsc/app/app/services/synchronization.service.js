var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
import { Inject, Injectable } from "@angular/core";
import { Events } from "@ionic/angular";
/** services */
import { SQLiteDatabaseService } from "./database.service";
import { FileService } from "./file.service";
import { FooterToolbarService, Job } from "./footer-toolbar.service";
import { TranslateService } from "@ngx-translate/core";
//TODO lp import {VISIT_JOURNAL_SYNCHRONIZATION, VisitJournalSynchronization} from "../learnplace/services/visitjournal.service";
//TODO lp import {LEARNPLACE_LOADER, LearnplaceLoader} from "../learnplace/services/loader/learnplace";
/** models */
import { Favorites } from "../models/favorites";
import { FileData } from "../models/file-data";
import { User } from "../models/user";
import { ILIASObject } from "../models/ilias-object";
/** logging */
import { Log } from "./log.service";
/** misc */
import { DataProvider } from "../providers/data-provider.provider";
import { NEWS_SYNCHRONIZATION } from "./news/news.synchronization";
var SynchronizationService = /** @class */ (function () {
    function SynchronizationService(dataProvider, events, fileService, footerToolbar, translate, newsSynchronization) {
        this.dataProvider = dataProvider;
        this.events = events;
        this.fileService = fileService;
        this.footerToolbar = footerToolbar;
        this.translate = translate;
        this.newsSynchronization = newsSynchronization;
        this.footerToolbarOfflineContent = new FooterToolbarService();
        this.syncOfflineQueue = [];
        this.syncOfflineQueueCnt = 0;
        this.recursiveSyncQueue = [];
    }
    SynchronizationService_1 = SynchronizationService;
    /**
     * Execute synchronization
     * If iliasObject is undefined, executes sync for desktop-data
     * If iliasObject is given, only fetches data for the given object
     * @param iliasObject
     * @returns Promise<Array<ILIASObject>>
     */
    SynchronizationService.prototype.liveLoad = function (iliasObject) {
        var _this = this;
        SynchronizationService_1.state.liveLoading = true;
        return this.loadCurrentUser()
            .then(function () {
            return _this.syncStarted()
                .then(function () { return _this.executeLiveLoad(iliasObject); })
                .catch(function (error) {
                return _this.syncEnded()
                    .then(function () {
                    _this.events.publish("sync:complete");
                    return Promise.reject(error);
                });
            })
                .then(function (promise) {
                SynchronizationService_1.state.liveLoading = false;
                return promise;
            });
        });
    };
    /**
     * Execute synchronization for all iliasObjects that are favorites and their children
     * @returns Promise<void>
     */
    SynchronizationService.prototype.loadAllOfflineContent = function () {
        return __awaiter(this, void 0, void 0, function () {
            var favorites;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadCurrentUser()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Favorites.findByUserId(this.user.id)];
                    case 2:
                        favorites = _a.sent();
                        if (favorites.length === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.addObjectsToSyncQueue(favorites)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add ILIASObjects to the syncOfflineQueue for offline-synchronization and start offline-sync, if it is not already running
     * @param iliasObjects
     */
    SynchronizationService.prototype.addObjectsToSyncQueue = function (iliasObjects) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadCurrentUser()];
                    case 1:
                        _a.sent();
                        this.syncOfflineQueue = Array.prototype.concat(this.syncOfflineQueue, iliasObjects);
                        this.updateOfflineSyncStatusMessage();
                        if (!!SynchronizationService_1.state.loadingOfflineContent) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.processOfflineSyncQueue()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Download all ILIASObjects and their contents in the syncOfflineQueue
     */
    SynchronizationService.prototype.processOfflineSyncQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ilObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.syncOfflineQueue.length === this.syncOfflineQueueCnt) {
                            this.syncOfflineQueue = [];
                            this.syncOfflineQueueCnt = 0;
                            SynchronizationService_1.state.loadingOfflineContent = false;
                            return [2 /*return*/];
                        }
                        SynchronizationService_1.state.loadingOfflineContent = true;
                        this.updateOfflineSyncStatusMessage();
                        ilObj = this.syncOfflineQueue[this.syncOfflineQueueCnt];
                        if (!ilObj.isFavorite) return [3 /*break*/, 6];
                        return [4 /*yield*/, ilObj.setIsFavorite(2)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.loadOfflineObjectRecursive(ilObj)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, ILIASObject.setOfflineAvailableRecursive(ilObj, this.user, true)];
                    case 3:
                        _a.sent();
                        if (!ilObj.isFavorite) return [3 /*break*/, 5];
                        return [4 /*yield*/, ilObj.setIsFavorite(1)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        ilObj.removeFromFavorites(this.fileService);
                        _a.label = 6;
                    case 6:
                        this.syncOfflineQueueCnt++;
                        this.footerToolbarOfflineContent.removeJob(Job.FileDownload);
                        return [4 /*yield*/, this.processOfflineSyncQueue()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Set the status-message of the offline-synchronization
     */
    SynchronizationService.prototype.updateOfflineSyncStatusMessage = function () {
        var cnt = this.syncOfflineQueueCnt + 1;
        var size = this.syncOfflineQueue.length;
        var title = this.syncOfflineQueue[this.syncOfflineQueueCnt].title;
        var footerMsg = this.translate.instant("object-list.downloading") + " " + cnt + "/" + size + " \"" + title + "\"";
        this.footerToolbarOfflineContent.removeJob(Job.FileDownload);
        this.footerToolbarOfflineContent.addJob(Job.FileDownload, footerMsg);
    };
    /**
     * Execute synchronization for an iliasObject and all its children
     * @param iliasObject
     * @returns Promise<SyncResults>
     */
    SynchronizationService.prototype.loadOfflineObjectRecursive = function (iliasObject) {
        return __awaiter(this, void 0, void 0, function () {
            var resolver_1, rejecter_1, promise;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("method - loadOfflineObjectRecursive");
                        return [4 /*yield*/, iliasObject.setIsFavorite(2)];
                    case 1:
                        _a.sent();
                        if (SynchronizationService_1.state.recursiveSyncRunning) {
                            promise = new Promise(function (resolve, reject) {
                                resolver_1 = resolve;
                                rejecter_1 = reject;
                            });
                            this.recursiveSyncQueue.push({
                                object: iliasObject,
                                resolver: resolver_1,
                                rejecter: rejecter_1
                            });
                            return [2 /*return*/, promise];
                        }
                        return [2 /*return*/, this.downloadContainerContent(iliasObject)
                                .then(function (syncResult) {
                                if (_this.recursiveSyncQueue.length > 0) {
                                    var sync_1 = _this.recursiveSyncQueue.pop();
                                    _this.loadOfflineObjectRecursive(sync_1.object)
                                        .then(function (syncResult) {
                                        sync_1.resolver(syncResult);
                                    }).catch(function (error) {
                                        sync_1.rejecter(error);
                                    });
                                }
                                return Promise.resolve(syncResult);
                            })
                                .catch(function (error) {
                                return Promise.reject(error);
                            })];
                }
            });
        });
    };
    SynchronizationService.prototype.downloadContainerContent = function (container) {
        return __awaiter(this, void 0, void 0, function () {
            var iliasObjects, syncResults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dataProvider.getObjectData(container, this.user, true)];
                    case 1:
                        iliasObjects = _a.sent();
                        iliasObjects.push(container);
                        return [4 /*yield*/, this.checkForFileDownloads(iliasObjects)];
                    case 2:
                        syncResults = _a.sent();
                        return [4 /*yield*/, Promise.all(syncResults.fileDownloads).catch(function () { return console.warn("Encountered some problem in method 'downloadContainerContent' with container " + container.title); })];
                    case 3:
                        _a.sent();
                        //TODO lp await this.downloadLearnplaces(iliasObjects).toPromise();
                        return [2 /*return*/, syncResults];
                }
            });
        });
    };
    /*TODO lp
        private downloadLearnplaces(tree: Array<ILIASObject>): Observable<{}> {
            return merge(...tree
                .filter(it => it.isLearnplace())
                .map(it => from(
                    this.learnplaceLoader.load(it.objId).then(() => {
                it.needsDownload = false;
                    })
                ))
            );
        }
    */
    /**
     * Set the user-variable of the object
     */
    SynchronizationService.prototype.loadCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, User.currentUser()];
                    case 1:
                        _a.user = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * set local recursiveSyncRunning and db entry that a sync is in progress
     */
    SynchronizationService.prototype.syncStarted = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        SynchronizationService_1.state.recursiveSyncRunning = true;
                        SQLiteDatabaseService.instance().then(function (db) {
                            db.query("INSERT INTO synchronization (userId, startDate, endDate, recursiveSyncRunning) VALUES (" + _this.user.id + ", date('now'), NULL, 1)")
                                .then(function () {
                                resolve();
                            }).catch(function (err) {
                                Log.error(_this, err);
                                reject();
                            });
                        });
                    })];
            });
        });
    };
    /**
     * set local recursiveSyncRunning and closes the db entry that a sync is in progress
     */
    SynchronizationService.prototype.syncEnded = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                SynchronizationService_1.state.recursiveSyncRunning = false;
                Log.write(this, "ending Sync.");
                return [2 /*return*/, SQLiteDatabaseService.instance()
                        .then(function (db) { return db.query("UPDATE synchronization SET recursiveSyncRunning = 0, endDate = date('now') WHERE userId = " + _this.user.id + " AND recursiveSyncRunning = 1"); })
                        .then(function () { return _this.updateLastSync(_this.user.id); })];
            });
        });
    };
    SynchronizationService.prototype.updateLastSync = function (userId) {
        var _this = this;
        return SQLiteDatabaseService.instance()
            .then(function (db) {
            return db.query("SELECT endDate FROM synchronization WHERE userId = " + userId + " AND endDate not Null ORDER BY endDate DESC LIMIT 1");
        })
            .then(function (result) {
            if (result.rows.length == 0)
                return Promise.resolve(null);
            Log.describe(_this, "last sync: ", new Date(result.rows.item(0).endDate));
            var now = new Date();
            _this.lastSync = new Date(result.rows.item(0).endDate);
            var date_string = "";
            if (now.getMonth() == _this.lastSync.getMonth() && now.getFullYear() == _this.lastSync.getFullYear()) {
                if (now.getDate() == _this.lastSync.getDate()) {
                    date_string = _this.translate.instant("today");
                }
                else if ((now.getDate() - 1) == _this.lastSync.getDate()) {
                    date_string = _this.translate.instant("yesterday");
                }
            }
            date_string = date_string ? date_string : _this.lastSync.getDate() + "." + (_this.lastSync.getMonth() + 1) + "." + _this.lastSync.getFullYear();
            _this.lastSyncString = date_string;
            Log.describe(_this, "lastdate", _this.lastSync);
            return Promise.resolve(_this.lastSync);
        });
    };
    /**
     * check if the user still has a running sync in the db.
     */
    SynchronizationService.prototype.hasUnfinishedSync = function (user) {
        if (!user)
            return Promise.reject("No user given.");
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query("SELECT * FROM synchronization WHERE recursiveSyncRunning = 1 AND userId = " + user.id); })
            .then(function (result) { return Promise.resolve(result.rows.length > 0); });
    };
    /**
     * Get all objects marked as offline available by the user
     * @param user
     * @returns {Promise<ILIASObject[]>}
     */
    SynchronizationService.prototype.getOfflineAvailableObjects = function (user) {
        var sql = "SELECT * FROM objects WHERE userId = ? AND isOfflineAvailable = 1 AND offlineAvailableOwner = ?";
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query(sql, [user.id, ILIASObject.OFFLINE_OWNER_USER]); })
            .then(function (response) {
            var iliasObjectPromises = [];
            for (var i = 0; i < response.rows.length; i++) {
                iliasObjectPromises.push(ILIASObject.find(response.rows.item(i).id));
            }
            return Promise.all(iliasObjectPromises);
        });
    };
    /**
     * Finds all files that should be downloaded. Also performs checks if these files can be downloaded based
     * on the user's settings
     * @param iliasObjects
     */
    SynchronizationService.prototype.checkForFileDownloads = function (iliasObjects) {
        var _this = this;
        var fileDownloads = [];
        return new Promise(function (resolve, reject) {
            _this.user.settings.then(function (settings) {
                FileData.getTotalDiskSpace().then(function (space) {
                    // We split the objects in different categories.
                    var downloads = [];
                    var filesTooBig = [];
                    var noMoreSpace = [];
                    var filesAlreadySynced = [];
                    // Furthermore we need some infos
                    var availableSpace = settings.quotaSize * 1000 * 1000;
                    var currentlyUsedSpace = space;
                    // make sure to only sync files.
                    var fileObjects = iliasObjects.filter(function (iliasObject) {
                        return iliasObject.type == "file";
                    });
                    // We sort all objects to know which to download and which to leave out.
                    fileObjects.forEach(function (fileObject) {
                        if (fileObject.needsDownload) {
                            var fileSize = parseInt(fileObject.data.fileSize, 10);
                            if (currentlyUsedSpace + fileSize <= availableSpace) {
                                if (fileSize <= settings.downloadSize * 1000 * 1000) {
                                    downloads.push(fileObject);
                                    currentlyUsedSpace += fileSize;
                                }
                                else {
                                    filesTooBig.push({ object: fileObject, reason: LeftOutReason.FileTooBig });
                                }
                            }
                            else {
                                noMoreSpace.push({ object: fileObject, reason: LeftOutReason.QuotaExceeded });
                            }
                        }
                        else {
                            filesAlreadySynced.push(fileObject);
                        }
                    });
                    // We make a copy of the files to download, as the list gets decreased in the download process
                    var allDownloads = downloads.slice(0); // This is the javascript's clone function....
                    // we execute the file downloads
                    var executeDownloads = _this.executeFileDownloads(downloads);
                    var _loop_1 = function (i) {
                        fileDownloads.push(new Promise(function (resolve, reject) {
                            executeDownloads[i].then(function () {
                                resolve();
                            }).catch(function (error) {
                                Log.describe(_this, "Execute File Download rejected", error);
                                reject(error);
                            });
                        }));
                    };
                    for (var i = 0; i < downloads.length; i++) {
                        _loop_1(i);
                    }
                    resolve(new SyncResults(fileObjects, allDownloads, filesAlreadySynced, filesTooBig.concat(noMoreSpace), fileDownloads));
                }).catch(function (error) {
                    return Promise.reject(error);
                });
            }).catch(function (error) {
                return Promise.reject(error);
            });
        });
    };
    /**
     * Downloads one file after another
     */
    SynchronizationService.prototype.executeFileDownloads = function (downloads) {
        var _this = this;
        var results = [];
        var _loop_2 = function (download) {
            results.push(new Promise(function (resolve, reject) {
                _this.fileService.download(download).then(function () {
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            }));
        };
        for (var _i = 0, downloads_1 = downloads; _i < downloads_1.length; _i++) {
            var download = downloads_1[_i];
            _loop_2(download);
        }
        return results;
    };
    SynchronizationService.prototype.executeNewsSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadCurrentUser()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.newsSynchronization.synchronize()];
                    case 2:
                        _a.sent();
                        //TODO lp await this.visitJournalSynchronization.synchronize();
                        return [4 /*yield*/, this.syncEnded()];
                    case 3:
                        //TODO lp await this.visitJournalSynchronization.synchronize();
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SynchronizationService.prototype.executeLiveLoad = function (parent) {
        return __awaiter(this, void 0, void 0, function () {
            var iliasObjects, _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        iliasObjects = (parent === undefined) ?
                            this.dataProvider.getDesktopData(this.user) :
                            this.dataProvider.getObjectData(parent, this.user, false);
                        _b = (_a = iliasObjects
                            .then(function () { return _this.syncEnded(); })
                            .then(function () { return Promise.resolve(iliasObjects); })).catch;
                        return [4 /*yield*/, this.syncEnded()];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    var SynchronizationService_1;
    SynchronizationService.state = {
        liveLoading: false,
        loadingOfflineContent: false,
        recursiveSyncRunning: false
    };
    SynchronizationService = SynchronizationService_1 = __decorate([
        Injectable({
            providedIn: "root"
        }),
        __param(5, Inject(NEWS_SYNCHRONIZATION)),
        __metadata("design:paramtypes", [DataProvider,
            Events,
            FileService,
            FooterToolbarService,
            TranslateService, Object])
    ], SynchronizationService);
    return SynchronizationService;
}());
export { SynchronizationService };
var SyncResults = /** @class */ (function () {
    function SyncResults(totalObjects, objectsDownloaded, objectsUnchanged, objectsLeftOut, fileDownloads) {
        this.totalObjects = totalObjects;
        this.objectsDownloaded = objectsDownloaded;
        this.objectsUnchanged = objectsUnchanged;
        this.objectsLeftOut = objectsLeftOut;
        this.fileDownloads = fileDownloads;
    }
    return SyncResults;
}());
export { SyncResults };
/**
 * WARNING at the moment we only use FileTooBig, the other two reasons lead to an abortion of the sync!
 */
export var LeftOutReason;
(function (LeftOutReason) {
    // In most cases you don't want to download files if you're not in the wlan.
    LeftOutReason[LeftOutReason["NoWLAN"] = 1] = "NoWLAN";
    // In the settings you can specify how big files should be you want to download.
    LeftOutReason[LeftOutReason["FileTooBig"] = 2] = "FileTooBig";
    // In the settings you can set a max quota.
    LeftOutReason[LeftOutReason["QuotaExceeded"] = 3] = "QuotaExceeded";
})(LeftOutReason || (LeftOutReason = {}));
//# sourceMappingURL=synchronization.service.js.map