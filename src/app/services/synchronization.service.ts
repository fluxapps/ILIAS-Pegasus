/** angular */
import { Inject, Injectable } from "@angular/core";
import { FileEntry } from "@ionic-native/file";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { from, merge, Observable } from "rxjs";
import { OfflineException } from "../exceptions/OfflineException";
import { LearningModuleLoader } from "../learningmodule/services/learning-module-loader";
import { LEARNING_MODULE_MANAGER } from "../learningmodule/services/learning-module-manager";
import { LEARNPLACE_MANAGER, LearnplaceManager } from "../learnplace/services/learnplace.management";
import { VISIT_JOURNAL_SYNCHRONIZATION, VisitJournalSynchronization } from "../learnplace/services/visitjournal.service";
/** models */
import { FileData } from "../models/file-data";
import { FavouriteStatus, ILIASObject } from "../models/ilias-object";
import { Settings } from "../models/settings";
import { User } from "../models/user";
import { AuthenticationProvider } from "../providers/authentication.provider";
/** misc */
import { DataProvider } from "../providers/data-provider.provider";
import { NetworkProvider, NetworkStatus } from "../providers/network.provider";
import { ThemeProvider } from "../providers/theme/theme.provider";
/** services */
import { SQLiteDatabaseService } from "./database.service";
import { FileService } from "./file.service";
import { UserStorageService } from "./filesystem/user-storage.service";
import { FooterToolbarService, Job } from "./footer-toolbar.service";
/** logging */
import { Logger } from "./logging/logging.api";
import { Logging } from "./logging/logging.service";
import { NEWS_SYNCHRONIZATION, NewsSynchronization } from "./news/news.synchronization";

interface SettledPromise<T> {
    status: "fulfilled" | "rejected";
    value?: T;
    reason?: unknown;
}

interface RejectedSettledPromise {
    status: "fulfilled";
    reason: Error;
}

export interface SynchronizationState {
    liveLoading: boolean,
    loadingOfflineContent: boolean,
    recursiveSyncRunning: boolean
}

interface SyncEntry {
    object: ILIASObject,
    resolver: any,
    rejecter: any
}

@Injectable({
    providedIn: "root"
})
export class SynchronizationService {

    static state: SynchronizationState = {
        liveLoading: false,
        loadingOfflineContent: false,
        recursiveSyncRunning: false
    };
    readonly footerToolbarOfflineContent: FooterToolbarService = new FooterToolbarService();
    private readonly log: Logger = Logging.getLogger("SynchronizationService");

    private user: User;

    private syncOfflineQueue: Array<ILIASObject> = [];
    private syncOfflineQueueCnt: number = 0;
    private recursiveSyncQueue: Array<SyncEntry> = [];

    lastSync: Date;
    lastSyncString: string;

    constructor(private readonly dataProvider: DataProvider,
                private readonly fileService: FileService,
                private readonly userStorage: UserStorageService,
                private readonly footerToolbar: FooterToolbarService,
                private readonly translate: TranslateService,
                @Inject(NEWS_SYNCHRONIZATION) private readonly newsSynchronization: NewsSynchronization,
                @Inject(VISIT_JOURNAL_SYNCHRONIZATION) private readonly visitJournalSynchronization: VisitJournalSynchronization,
                @Inject(LEARNPLACE_MANAGER) private readonly learnplaceManager: LearnplaceManager,
                @Inject(LEARNING_MODULE_MANAGER) private readonly learningModuleManager: LearningModuleLoader,
                private readonly alertCtr: AlertController,
                private readonly themeProvider: ThemeProvider,
                networkProvider: NetworkProvider
    ) {
        networkProvider.state.subscribe(state => {
            if (state === NetworkStatus.Online && AuthenticationProvider.isLoggedIn()) {
                console.log('Im Online and downloading now');
                this.loadAllOfflineContent();
            }
        })
    }

    /**
     * cancels all synchronization-processes and error-corrects
     * database-entries of the corresponding ilias-objects
     */
    async resetOfflineSynchronization(askUserToLoadNow: boolean = false): Promise<void> {
        this.user = AuthenticationProvider.getUser();

        // reset the object-variables
        this.syncOfflineQueue = [];
        this.syncOfflineQueueCnt = 0;
        this.recursiveSyncQueue = [];

        SynchronizationService.state = {
            liveLoading: false,
            loadingOfflineContent: false,
            recursiveSyncRunning: false
        };

        // handle the pending downloads
        const objects: Array<ILIASObject> = await ILIASObject.getAllOpenDownloads(this.user);
        if (!objects.length) return;
        if (askUserToLoadNow) {
            let dismiss: boolean = false;
            const buttons: Array<{ text: string, handler(): void; }> = window.navigator.onLine ?
                [{
                    text: this.translate.instant("sync.remove_from_favorites"),
                    handler: (): void => {
                        dismiss = true;
                    }
                }, {
                    text: this.translate.instant("sync.load_now"),
                    handler: (): void => {
                        dismiss = false;
                    }
                }] :
                [{
                    text: this.translate.instant("sync.ok"),
                    handler: (): void => {
                        dismiss = true;
                    }
                }];

            let objectsList: string = "<br>";
            objects.forEach((o: ILIASObject) => objectsList += `<br>• <i>${o.title}</i>`);

            const alert: HTMLIonAlertElement = await this.alertCtr.create({
                header: this.translate.instant("sync.open_downloads_title"),
                message: ((objects.length === 1) ?
                        this.translate.instant("sync.open_downloads_text_sng") :
                        this.translate.instant("sync.open_downloads_text_plr").replace(/NUM/, objects.length.toString(10))
                ) + objectsList,
                buttons: buttons
            });
            await alert.present();
            await alert.onDidDismiss();
            if (dismiss) objects.forEach((o: ILIASObject) => o.removeFromFavorites(this.userStorage, true));
            else await this.addObjectsToSyncQueue(objects);
        } else {
            objects.forEach((o: ILIASObject) => o.removeFromFavorites(this.userStorage, true));
        }
    }

    /**
     * Execute synchronization
     * If iliasObject is undefined, executes sync for desktop-data
     * If iliasObject is given, only fetches data for the given object
     * @param iliasObject
     * @returns Promise<Array<ILIASObject>>
     */
    async liveLoad(iliasObject?: ILIASObject): Promise<Array<ILIASObject>> {
        try {
            SynchronizationService.state.liveLoading = true;

            this.user = AuthenticationProvider.getUser();
            await this.syncStarted();
            const iliasObjects: Array<ILIASObject> = await this.executeLiveLoad(iliasObject);
            await this.processOpenSynchronizationTasks();
            return iliasObjects;
        } catch (error) {
            await this.syncEnded();
            throw error;
        } finally {
            SynchronizationService.state.liveLoading = false;
        }
    }

    /**
     * Execute synchronization for all iliasObjects that are favorites and their children
     * @returns Promise<void>
     */
    async loadAllOfflineContent(): Promise<void> {
        if (SynchronizationService.state.loadingOfflineContent) return;

        this.user = AuthenticationProvider.getUser();
        const favorites: Array<ILIASObject> = await ILIASObject.getFavoritesByUserId(this.user.id);
        if (favorites.length === 0) return;
        await this.addObjectsToSyncQueue(favorites);
    }

    /**
     * Add ILIASObjects to the syncOfflineQueue for offline-synchronization and start offline-sync, if it is not already running
     * @param iliasObjects
     */
    async addObjectsToSyncQueue(iliasObjects: ILIASObject | Array<ILIASObject>): Promise<void> {
        this.user = AuthenticationProvider.getUser();
        this.syncOfflineQueue = Array.prototype.concat(this.syncOfflineQueue, iliasObjects);
        this.updateOfflineSyncStatusMessage();

        if (!SynchronizationService.state.loadingOfflineContent)
            await this.processOfflineSyncQueue();
    }

    /**
     * Download all ILIASObjects and their contents in the syncOfflineQueue
     */
    async processOfflineSyncQueue(): Promise<void> {
        if (!window.navigator.onLine) {
            await this.resetOfflineSynchronization();
            throw new OfflineException("Tried to sync files when device was offline.");
        }

        if (this.syncOfflineQueue.length <= this.syncOfflineQueueCnt) {

            this.syncOfflineQueue = [];
            this.syncOfflineQueueCnt = 0;
            SynchronizationService.state.loadingOfflineContent = false;
            await this.processOpenSynchronizationTasks();

            return;
        }

        SynchronizationService.state.loadingOfflineContent = true;
        this.updateOfflineSyncStatusMessage();

        const ilObj: ILIASObject = this.syncOfflineQueue[this.syncOfflineQueueCnt];
        // the user may has unmarked the object in the mean time
        if (ilObj.isFavorite) {

            await ilObj.setIsFavorite(FavouriteStatus.PENDING);
            try {
                await this.loadOfflineObjectRecursive(ilObj);
            } catch (e) {
                console.warn(`sync resulted in an error ${e.message}`);
            }
            await ILIASObject.setOfflineAvailableRecursive(ilObj, this.user, true);
            // the user may has unmarked the object in the mean time
            if (ilObj.isFavorite) await ilObj.setIsFavorite(FavouriteStatus.DOWNLOADED);
            else await ilObj.removeFromFavorites(this.userStorage);
        }

        this.syncOfflineQueueCnt++;
        this.footerToolbarOfflineContent.removeJob(Job.FileDownload);
        await this.processOfflineSyncQueue();
    }

    /**
     * Set the status-message of the offline-synchronization
     */
    private updateOfflineSyncStatusMessage(): void {

        const cnt: number = this.syncOfflineQueueCnt + 1;
        const size: number = this.syncOfflineQueue.length;
        const title: string = this.syncOfflineQueue[this.syncOfflineQueueCnt].title;
        const footerMsg: string = `${this.translate.instant("object-list.downloading")} ${cnt}/${size} "${title}"`;

        this.footerToolbarOfflineContent.removeJob(Job.FileDownload);
        this.footerToolbarOfflineContent.addJob(Job.FileDownload, footerMsg);
    }

    /**
     * Execute synchronization for an iliasObject and all its children
     * @param iliasObject
     * @returns Promise<SyncResults>
     */
    async loadOfflineObjectRecursive(iliasObject: ILIASObject): Promise<SyncResults> {
        await iliasObject.setIsFavorite(FavouriteStatus.PENDING);
        if (SynchronizationService.state.recursiveSyncRunning) {
            let resolver: any;
            let rejecter: any;
            const promise: Promise<SyncResults> = new Promise((resolve, reject) => {
                resolver = resolve;
                rejecter = reject;
            });
            this.recursiveSyncQueue.push({
                object: iliasObject,
                resolver: resolver,
                rejecter: rejecter
            });
            return promise;
        }

        return this.downloadContainerContent(iliasObject)
            .then((syncResult) => {
                if (this.recursiveSyncQueue.length > 0) {
                    const sync: SyncEntry = this.recursiveSyncQueue.pop();
                    this.loadOfflineObjectRecursive(sync.object)
                        .then((syncResult: SyncResults) => {
                            sync.resolver(syncResult);
                        }).catch(error => {
                        sync.rejecter(error);
                    });
                }
                return Promise.resolve(syncResult);
            });
    }

    async downloadContainerContent(container: ILIASObject): Promise<SyncResults> {
        const iliasObjects: Array<ILIASObject> = await this.dataProvider.getObjectData({
            parentObject: container,
            user: this.user,
            recursive: true,
            refreshFiles: true,
            downloadMetadata: true
        });

        iliasObjects.push(container);
        const syncResults: SyncResults = await this.checkForFileDownloads(iliasObjects);
        // @ts-ignore
        // TS 3.5 does not have the type definition included
        const results: Array<SettledPromise<FileEntry>> = await Promise.allSettled(syncResults.fileDownloads);
        results
            .filter((result) => result.status === "rejected")
            .forEach((result) => {
                const reason = !!result.reason ? (result.reason as Error).message : "unknown";
                this.log.warn(() => `Encountered some problem in method 'downloadContainerContent' with element ${container.title}, reason: ${reason}`);
            });
        await this.downloadLearnplaces(iliasObjects).toPromise();
        await this.downloadLearningModules(iliasObjects);
        return syncResults;
    }

    private downloadLearnplaces(tree: Array<ILIASObject>): Observable<{}> {
        return merge(...tree
            .filter(it => it.isLearnplace())
            .map(it => from(
                this.learnplaceManager.load(it.objId).then(
                    () => it.needsDownload = false
                )))
        );
    }

    private async downloadLearningModules(iliasObjects: Array<ILIASObject>): Promise<void> {
        for (const io of iliasObjects) {
            if (io.type === "htlm" || io.type === "sahs") {
                await this.learningModuleManager.load(io.objId);
                io.needsDownload = false;
                await io.save();
            }
        }
    }

    /**
     * set local recursiveSyncRunning and db entry that a sync is in progress
     */
    private async syncStarted(): Promise<void> {
        try {
            SynchronizationService.state.recursiveSyncRunning = true;
            const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
            await db.query(`INSERT INTO synchronization (userId, startDate, endDate, recursiveSyncRunning) VALUES (${this.user.id}, date('now'), NULL, 1)`);
        } catch (error) {
            this.log.error(() => `Encountered error while staring sync, with message: "${error.message}"`);
        }

    }

    /**
     * set local recursiveSyncRunning and closes the db entry that a sync is in progress
     */
    private async syncEnded(): Promise<void> {
        SynchronizationService.state.recursiveSyncRunning = false;
        this.log.debug(() => "Synchronisation ending");

        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        await db.query(
            "UPDATE synchronization SET recursiveSyncRunning = 0, endDate = date('now') WHERE userId = ? AND recursiveSyncRunning = 1;",
            [this.user.id]
        );
        await this.updateLastSync(this.user.id);
        this.log.info(() => "Synchronisation finished");
    }

    async updateLastSync(userId: number): Promise<any> {
        return SQLiteDatabaseService.instance()
            .then(db =>
                db.query(
                    "SELECT endDate FROM synchronization WHERE userId = ? AND endDate not Null ORDER BY endDate DESC LIMIT 1",
                    [userId])
            )
            .then((result) => {
                if (result.rows.length === 0)
                    return null;
                this.log.info(() => `last sync: ${new Date(result.rows.item(0).endDate)}`);
                const now: Date = new Date();
                this.lastSync = new Date(result.rows.item(0).endDate);

                let dateString: string = "";
                if (now.getMonth() == this.lastSync.getMonth() && now.getFullYear() == this.lastSync.getFullYear()) {
                    if (now.getDate() == this.lastSync.getDate()) {
                        dateString = this.translate.instant("today");
                    } else if ((now.getDate() - 1) == this.lastSync.getDate()) {
                        dateString = this.translate.instant("yesterday");
                    }
                }

                dateString = dateString ? dateString : `${this.lastSync.getDate()}.${this.lastSync.getMonth() + 1}.${this.lastSync.getFullYear()}`;
                this.lastSyncString = dateString;
                this.log.debug(() => `lastdate: ${this.lastSync}`);
                return Promise.resolve(this.lastSync);
            });
    }

    /**
     * Finds all files that should be downloaded. Also performs checks if these files can be downloaded based
     * on the user's settings
     * @param iliasObjects
     */
    protected async checkForFileDownloads(iliasObjects: Array<ILIASObject>): Promise<SyncResults> {
        const settings: Settings = await this.user.settings;
        const space: number = await FileData.getTotalDiskSpace();
        // We split the objects in different categories.
        const downloads: Array<ILIASObject> = [];
        const filesTooBig: Array<{ object: ILIASObject, reason: LeftOutReason }> = [];
        const noMoreSpace: Array<{ object: ILIASObject, reason: LeftOutReason }> = [];
        const filesAlreadySynced: Array<ILIASObject> = [];

        // Furthermore we need some infos
        const availableSpace: number = settings.quotaSize * 1000 * 1000;
        let currentlyUsedSpace: number = space;

        // make sure to only sync files.
        const fileObjects: Array<ILIASObject> = iliasObjects.filter(iliasObject => {
            return iliasObject.type === "file";
        });

        // We sort all objects to know which to download and which to leave out.
        fileObjects.forEach(fileObject => {
            if (fileObject.needsDownload !== false) {
                const fileSize: number = Number.parseInt(fileObject.data.fileSize, 10);
                if (currentlyUsedSpace + fileSize <= availableSpace) {
                    if (fileSize <= settings.downloadSize * 1000 * 1000) {
                        downloads.push(fileObject);
                        currentlyUsedSpace += fileSize;
                    } else {
                        filesTooBig.push({object: fileObject, reason: LeftOutReason.FileTooBig});
                    }
                } else {
                    noMoreSpace.push({object: fileObject, reason: LeftOutReason.QuotaExceeded});
                }
            } else {
                filesAlreadySynced.push(fileObject);
            }
        });

        // We make a copy of the files to download, as the list gets decreased in the download process
        const allDownloads: Array<ILIASObject> = Array.from(downloads); // Create shallow copy of array

        // we execute the file downloads
        const fileDownloads: Array<Promise<FileEntry>> = this.executeFileDownloads(downloads);
        this.log.info(() => `Pending downloads: ${fileDownloads.length}`);

        return new SyncResults(
            fileObjects,
            allDownloads,
            filesAlreadySynced,
            filesTooBig.concat(noMoreSpace),
            fileDownloads
        );
    }

    /**
     * Downloads one file after another
     */
    protected executeFileDownloads(downloads: Array<ILIASObject>): Array<Promise<FileEntry>> {
        const results: Array<Promise<FileEntry>> = [];
        for (const download of downloads) {
            results.push(this.fileService.download(download))
        }
        return results;
    }

    async executeNewsSync(): Promise<void> {
        this.user = AuthenticationProvider.getUser();
        await this.newsSynchronization.synchronize();
        await this.visitJournalSynchronization.synchronize();
        await this.processOfflineSyncQueue();
        await this.syncEnded();
    }

    private async executeLiveLoad(parent: ILIASObject | undefined = undefined): Promise<Array<ILIASObject>> {
        try {
            return (parent === undefined) ?
                this.dataProvider.getDesktopData(this.user) :
                this.dataProvider.getObjectData({
                    parentObject: parent,
                    user: this.user,
                    recursive: false,
                    refreshFiles: true,
                    downloadMetadata: true
                });
        } finally {
            await this.syncEnded();
        }
    }

    /**
     * this method is called by all main synchronization events, after their completion. it contains a list of
     * tasks that should periodically be processed in order to maintain a synchronized state with the ILIAS-server
     */
    private async processOpenSynchronizationTasks(): Promise<void> {
        await this.synchronizeFileLearningProgresses();
        await this.themeProvider.synchronizeAndSetCustomTheme();
    }

    /**
     * loads all file-entries where the fileLearningProgressPushToServer-flag is set to true, and invokes
     * a method that posts for each result
     */
    async synchronizeFileLearningProgresses(): Promise<void> {
        if (!window.navigator.onLine) return;

        const unsynced: Array<FileData> = await FileData.getOpenLearningProgressPosts();
        await this.fileService.postLearningProgressDone(unsynced);
    }
}

export class SyncResults {
    constructor(public totalObjects: Array<ILIASObject>,
                public objectsDownloaded: Array<ILIASObject>,
                public objectsUnchanged: Array<ILIASObject>,
                public objectsLeftOut: Array<{ object: ILIASObject, reason: LeftOutReason }>,
                public fileDownloads: Array<Promise<FileEntry>>) {
    }
}

/**
 * WARNING at the moment we only use FileTooBig, the other two reasons lead to an abortion of the sync!
 */
export enum LeftOutReason {
    // In most cases you don't want to download files if you're not in the wlan.
    NoWLAN = 1,
    // In the settings you can specify how big files should be you want to download.
    FileTooBig = 2,
    // In the settings you can set a max quota.
    QuotaExceeded = 3
}
