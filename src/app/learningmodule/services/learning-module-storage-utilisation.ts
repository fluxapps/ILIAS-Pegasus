import { Inject, Injectable } from "@angular/core";
import { DirectoryEntry, File } from "@ionic-native/file/ngx";
import { FileStorageService } from "src/app/services/filesystem/file-storage.service";
import { StorageUtilization } from "../../services/filesystem/user-storage.mamager";
import { UserStorageService } from "../../services/filesystem/user-storage.service";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";
import { LEARNING_MODULE_PATH_BUILDER, LearningModulePathBuilder } from "./learning-module-path-builder";

@Injectable({
    providedIn: "root"
})
export class LearningModuleStorageUtilisation implements StorageUtilization {

    private readonly log: Logger = Logging.getLogger("LearningModuleStorageUtilisation");

    constructor(
        private readonly fileSystem: File,
        private readonly fileStorage: FileStorageService,
        @Inject(LEARNING_MODULE_PATH_BUILDER) private readonly pathBuilder: LearningModulePathBuilder,
    ) {
    }

    async getUsedStorage(objectId: number, userId: number): Promise<number> {
        try {
            const lmDirPath: string = await this.pathBuilder.getLmDirByObjId(objectId);
            const dir: DirectoryEntry = await this.fileSystem.resolveDirectoryUrl(lmDirPath);
            return this.fileStorage.getDirSizeRecursive(dir.nativeURL);
        } catch (error) {
            // Cordova file plugin throws its own error objects. Code 1 means NOT_FOUND_ERR.
            // See: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/#list-of-error-codes-and-meanings
            if (error.code === 1) {
                this.log.debug(() => `Directory of learning module with objId: ${objectId}, of user: ${userId} does not exist assume size 0 Byte`);
                return 0;
            }

            this.log.error(() => `Failed to calculate size for learning module with objId: ${objectId}, for user: ${userId}, reason: ${error.message}`);
            throw error;
        }
    }
}
