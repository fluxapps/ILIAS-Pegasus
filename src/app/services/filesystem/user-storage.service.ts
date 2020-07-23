import {File, Entry} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable, Inject} from "@angular/core";
import {ILIASObject} from "../../models/ilias-object";
import {Settings} from "../../models/settings";
import {FileService} from "../file.service";
import {LEARNPLACE_MANAGER, LearnplaceManager} from "../../learnplace/services/learnplace.management";
import {LEARNING_MODULE_MANAGER, LearningModuleManager} from "../../learningmodule/services/learning-module-manager";
import {UserStorageMamager} from "./user-storage.mamager";

@Injectable({
    providedIn: "root"
})
export class UserStorageService {
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
            console.trace("Start recursive removal of files");
            const iliasObjects: Array<ILIASObject> = await ILIASObject.findByParentRefIdRecursive(containerObject.refId, containerObject.userId);
            iliasObjects.push(containerObject);

            for(const fileObject of iliasObjects)
                await this.removeObject(fileObject);
            console.log("Deleting Files complete");
        }
        catch (error) {
            console.error(`An error occurred while deleting recursive files: ${JSON.stringify(error)}`);
            throw error;
        }
    }

    /**
     * deletes all locally stored objects that are not offline available
     * @param userId
     */
    async deleteAllCache(userId: number): Promise<void> {
        let used: number = await UserStorageMamager.getUsedStorage(userId);
        const settings: Settings = await Settings.findByUserId(userId);
        const ilObjList: Array<ILIASObject> = await ILIASObject.findByUserId(userId);
        for(let i: number = 0; i < ilObjList.length; i++) {
            await this.removeObject(ilObjList[i]);
        }
    }

    /**
     * takes a url with at least one subdirectory and returns an array with the
     * first entry as the path to the last directory and the second entry as the
     * name of the last directory
     * @param dir string
     */
    private static decomposeDirUrl(dir: string): Array<string> {
        let ind: number = dir.lastIndexOf("/");
        dir = dir.substring(0, ind);
        ind = dir.lastIndexOf("/");
        return [dir.substring(0, ind), dir.substring(ind+1, dir.length)];
    }

    /**
     * computes the used disk space for the contents of a directory
     * @param dir string
     * @param fileSystem
     */
    static async getDirSizeRecursive(dir: string, fileSystem: File): Promise<number> {
        let list: Array<Entry>;
        try {
            const dirArr: Array<string> = UserStorageService.decomposeDirUrl(dir);
            list = await fileSystem.listDir(dirArr[0], dirArr[1]);
        } catch (e) {
            console.log(`error: ${e.message} for directory ${dir}`);
        }

        let diskSpace: number = 0;

        let newList: Array<Entry>;
        while(list.length) {
            const entry: Entry = list.pop();
            if(entry.isFile) {
                entry.getMetadata(md => diskSpace += md.size);
            } else {
                const dirArr: Array<string> = UserStorageService.decomposeDirUrl(entry.nativeURL);
                newList = await fileSystem.listDir(dirArr[0], dirArr[1]);
                newList.forEach(e => list.push(e));
            }
        }

        return diskSpace;
    }
}
