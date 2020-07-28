/**
 * a service to manage learning modules
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import { Inject, Injectable, InjectionToken } from "@angular/core";
import { ILIASObject } from "../../models/ilias-object";
import { User } from "../../models/user";
import { AuthenticationProvider } from "../../providers/authentication.provider";
import { FileStorageService } from "../../services/filesystem/file-storage.service";
import { UserStorageMamager } from "../../services/filesystem/user-storage.mamager";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";
import { LearningModule } from "../models/learning-module";
import { LEARNING_MODULE_LOADER, LearningModuleLoader } from "./learning-module-loader";
import { LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder } from "./learning-module-path-builder";
import { LearningModuleStorageUtilisation } from "./learning-module-storage-utilisation";

export interface LearningModuleManager {

    /**
     * Loads all relevant data of the learning module
     * the given {@code objectId} and stores them.
     *
     * @param {number} objectId - ILIAS object id of the learning module
     */
    load(objectId: number): Promise<void>;

    /**
     * Checks whether the learning module is available on the mobile device
     * and downloads it if this is not the case
     */
    checkAndDownload(objectId: number, userId: number): Promise<void>;

    /**
     * Removes the learning module with the given id.
     * All stored files of the module will be removed as well.
     */
    remove(objectId: number, userId: number): Promise<void>;
}

export const LEARNING_MODULE_MANAGER: InjectionToken<LearningModuleManager> = new InjectionToken("token for learning module manager.");

/**
 * Implementation of the learning module manager interface.
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class LearningModuleManagerImpl implements LearningModuleManager {

    private readonly log: Logger = Logging.getLogger("LearningModuleManagerImpl");

    constructor(
        private readonly storageUtilisation: LearningModuleStorageUtilisation,
        private readonly fileStorage: FileStorageService,
        private readonly userStorageManager: UserStorageMamager,
        @Inject(LEARNING_MODULE_LOADER) private readonly loader: LearningModuleLoader,
        @Inject(LEARNING_MODULE_PATH_BUILDER) private readonly pathBuilder: LearningModulePathBuilder,
    ) {}

    async checkAndDownload(objectId: number, userId: number): Promise<void> {
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(objectId, userId);

        console.warn(`Learning module needs download: ${obj.needsDownload} -> ${!!obj.needsDownload}`);
        if (obj.needsDownload !== false) {
            await this.load(objectId);
            obj.needsDownload = false;
            await obj.save();
        }
    }

    async load(objectId: number): Promise<void> {
        await this.loader.load(objectId);
        const user: User = AuthenticationProvider.getUser();
        await this.userStorageManager.addObjectToUserStorage(user.id, objectId, this.storageUtilisation);
    }

    async remove(objId: number, userId: number): Promise<void> {
        this.log.debug(() => `Remove learning module object: "${objId}", user: "${userId}"`);
        await this.userStorageManager.removeObjectFromUserStorage(userId, objId, this.storageUtilisation);

        // remove from database
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(objId, userId);
        await lm.destroy();

        // remove from file system
        const localLmDir: string = await this.pathBuilder.dirInLocalLmDir("", false);
        const lmDirName: string = this.pathBuilder.lmDirName(objId);
        this.log.debug(() => `Remove learning module dir: "${lmDirName}", Path: "${localLmDir}"`);
        await this.fileStorage.removeDir(localLmDir, lmDirName);
    }
}
