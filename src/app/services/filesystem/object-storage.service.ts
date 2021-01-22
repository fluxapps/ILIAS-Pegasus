import {File} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable, Inject} from "@angular/core";
import {User} from "../../models/user";
import {ILIASObject} from "../../models/ilias-object";
import {FileService} from "../file.service";
import {LEARNPLACE_MANAGER, LearnplaceManager} from "../../learnplace/services/learnplace.management";
import {LEARNING_MODULE_MANAGER, LearningModuleManager} from "../../learningmodule/services/learning-module-manager";

export interface StorageUtilization {
    /**
     * computes the dist space used by a certain object
     * @param objectId id of the target object
     * @param userId user id for the owner of the target object
     */
    getUsedStorage(objectId: number, userId: number): Promise<number>;
}

@Injectable({
    providedIn: "root"
})
export class ObjectStorageService {
    private static storageDifferences: Array<{userId: number, difference: number}> = [];
    private static storageUpdateLock: boolean = false;

    constructor(
        private readonly fileSystem: File,
        private readonly platform: Platform,
        private readonly fileService: FileService,
        @Inject(LEARNPLACE_MANAGER) private readonly learnplaceManager: LearnplaceManager,
        @Inject(LEARNING_MODULE_MANAGER) private readonly learningModuleManager: LearningModuleManager
    ) {}

    /**
     * evaluates the storage used by an objects and adds this to the users used storage
     * @param userId
     * @param objectId
     * @param storage
     */
    static async addObjectToUserStorage(userId: number, objectId: number, storage: StorageUtilization): Promise<void> {
        const io: ILIASObject = await ILIASObject.find(objectId);
        if(io.isOfflineAvailable) return;

        const difference: number = await storage.getUsedStorage(objectId, userId);
        await ObjectStorageService.addDifferenceToUserStorage(userId, difference);

        io.isOfflineAvailable = true;
        await io.save();
    }

    /**
     * evaluates the storage used by an objects and removes this from the users used storage
     * @param userId
     * @param objectId
     * @param storage
     */
    static async removeObjectFromUserStorage(userId: number, objectId: number, storage: StorageUtilization): Promise<void> {
        const io: ILIASObject = await ILIASObject.find(objectId);
        if(!io.isOfflineAvailable) return;

        const difference: number = await storage.getUsedStorage(objectId, userId);
        await ObjectStorageService.addDifferenceToUserStorage(userId, -difference);

        io.isOfflineAvailable = false;
        await io.save();
    }

    /**
     * applies a difference in storage to the total used storage of the specified user
     * @param userId
     * @param difference
     */
    static async addDifferenceToUserStorage(userId: number, difference: number) {
        ObjectStorageService.storageDifferences.push({userId: userId, difference: difference});
        if (!ObjectStorageService.storageUpdateLock)
            this.applyDifferenceToUserStorage();
    }

    /**
     * used to serialize writes of the total used storage
     */
    static async applyDifferenceToUserStorage() {
        ObjectStorageService.storageUpdateLock = true;
        while(ObjectStorageService.storageDifferences.length) {
            const entry: {userId: number, difference: number} = ObjectStorageService.storageDifferences.pop();
            console.log(`storage: difference ${entry.difference}`);
            const user: User = await User.find(entry.userId);
            user.totalUsedStorage = Number(user.totalUsedStorage) + Number(entry.difference);
            await user.save();
            console.log(`storage: used ${user.totalUsedStorage} by ${user.id}`);
        }
        ObjectStorageService.storageUpdateLock = false;
    }
}
