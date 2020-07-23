/**
 * a service to manage learning modules
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {UserStorageService} from "../../services/filesystem/user-storage.service";
import {StorageUtilization} from "../../services/filesystem/user-storage.mamager";
import {LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder} from "./learning-module-path-builder";
import {LearningModule} from "../models/learning-module";
import {File, DirectoryEntry} from "@ionic-native/file/ngx";
import {ILIASObject} from "../../models/ilias-object";
import {LEARNING_MODULE_LOADER, LearningModuleLoader} from "./learning-module-loader";
import {User} from "../../models/user";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {UserStorageMamager} from "../../services/filesystem/user-storage.mamager";
import {FileStorageService} from "../../services/filesystem/file-storage.service";

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

    /**
     * Calculates the used storage of the learning module. The used storage within the sqlite database is not included.
     */
    getUsedStorage(objectId: number, userId: number): Promise<number>;
}

export const LEARNING_MODULE_MANAGER: InjectionToken<LearningModuleManager> = new InjectionToken("token for learning module manager.");

/**
 * Implementation of the learning module manager interface.
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class LearningModuleManagerImpl implements LearningModuleManager, StorageUtilization {
    constructor(
        protected readonly fileSystem: File,
        protected readonly fileStorage: FileStorageService,
        @Inject(LEARNING_MODULE_LOADER) private readonly loader: LearningModuleLoader,
        @Inject(LEARNING_MODULE_PATH_BUILDER) private readonly pathBuilder: LearningModulePathBuilder,
    ) {}

    async checkAndDownload(objectId: number, userId: number): Promise<void> {
        const obj: ILIASObject = await ILIASObject.findByObjIdAndUserId(objectId, userId);
        const alreadyLoaded: boolean = await obj.objectIsUnderFavorite();
        if(!alreadyLoaded) await this.load(objectId);
    }

    async load(objectId: number): Promise<void> {
        await this.loader.load(objectId);
        const user: User = AuthenticationProvider.getUser();
        await UserStorageMamager.addObjectToUserStorage(user.id, objectId, this);
    }

    async remove(objId: number, userId: number): Promise<void> {
        await UserStorageMamager.removeObjectFromUserStorage(userId, objId, this);
        // remove from database
        const lm: LearningModule = await LearningModule.findByObjIdAndUserId(objId, userId);
        await lm.destroy();
        // remove from file system
        const localLmDir: string = await this.pathBuilder.dirInLocalLmDir("", false);
        const lmDirName: string = this.pathBuilder.lmDirName(objId);
        await this.fileStorage.removeDir(localLmDir, lmDirName);
    }

    async getUsedStorage(objectId: number, userId: number): Promise<number> {
        const lmDirPath: string = await this.pathBuilder.getLmDirByObjId(objectId);
        const dir: DirectoryEntry = await this.fileSystem.resolveDirectoryUrl(lmDirPath);
        return UserStorageService.getDirSizeRecursive(dir.nativeURL, this.fileSystem);
    }
}
