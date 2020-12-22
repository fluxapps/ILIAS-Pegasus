import {File, Entry} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable, Inject} from "@angular/core";
import {ILIASObject} from "../../models/ilias-object";
import {Settings} from "../../models/settings";
import {FileService} from "../file.service";
import {LEARNPLACE_MANAGER, LearnplaceManager} from "../../learnplace/services/learnplace.management";
import {LEARNING_MODULE_MANAGER, LearningModuleManager} from "../../learningmodule/services/learning-module-manager";
import { Logger } from "../logging/logging.api";
import { Logging } from "../logging/logging.service";
import {UserStorageMamager} from "./user-storage.mamager";

@Injectable({
    providedIn: "root"
})
export class UserStorageService {

    private readonly log: Logger = Logging.getLogger("UserStorageService");

    constructor(
        private readonly fileSystem: File,
        private readonly platform: Platform,
        private readonly fileService: FileService,
        @Inject(LEARNPLACE_MANAGER) private readonly learnplaceManager: LearnplaceManager,
        @Inject(LEARNING_MODULE_MANAGER) private readonly learningModuleManager: LearningModuleManager
    ) {}

    /**
     * Deletes the local object on the device
     */
    async removeObject(iliasObject: ILIASObject): Promise<void> {
        if(iliasObject.type === "file")
            return this.fileService.removeFile(iliasObject);

        if(iliasObject.isLearnplace())
            return this.learnplaceManager.remove(iliasObject.objId, iliasObject.userId);

        if(iliasObject.type === "htlm" || iliasObject.type === "sahs")
            return this.learningModuleManager.remove(iliasObject.objId, iliasObject.userId);

        await iliasObject.setIsFavorite(0);
        await iliasObject.save();
    }

    /**
     * Remove all local files recursively under the given container ILIAS object
     * @param containerObject
     */
    async removeRecursive(containerObject: ILIASObject): Promise<void> {
        try {
            this.log.debug(() => "Start recursive removal of files");
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
     * deletes all locally stored objects that are not offline available
     * @param userId
     */
    async deleteAllCache(userId: number): Promise<void> {
        const ilObjList: Array<ILIASObject> = await ILIASObject.findByUserId(userId);
        for(let i: number = 0; i < ilObjList.length; i++) {
            await this.removeObject(ilObjList[i]);
        }
    }
}
