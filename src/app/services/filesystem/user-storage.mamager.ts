import { Injectable } from "@angular/core";
import { ILIASObject } from "../../models/ilias-object";
import { User } from "../../models/user";
import { Logger } from "../logging/logging.api";
import { Logging } from "../logging/logging.service";

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
export class UserStorageMamager {

    private readonly log: Logger = Logging.getLogger("UserStorageManager");
    private storageUsageByUser: Map<number, number> = new Map<number, number>();

    /**
     * total used storage for a given user, as registered in the database
     * @param userId
     */
    async getUsedStorage(userId: number): Promise<number> {
        const user: User = await User.find(userId);
        return Math.max(0, user.totalUsedStorage);
    }

    /**
     * evaluates the storage used by an objects and adds this to the users used storage
     * @param userId
     * @param objectId
     * @param storage
     */
    async addObjectToUserStorage(userId: number, objectId: number, storage: StorageUtilization): Promise<void> {
        const io: ILIASObject = await ILIASObject.findByObjIdAndUserId(objectId, userId);
        if(io.isOfflineAvailable) return;

        const difference: number = await storage.getUsedStorage(objectId, userId);
        const total: number = await this.getUsedStorage(userId);
        this.log.trace(() => `Add object to storage, diff: ${difference} to total: ${total}, new storage usage: ${total + difference}`);
        if ((total + difference) < 0) {
            this.log.error(() => `User storage manager out of sync, total: ${total}, with diff: ${difference} is negative!`);
        }
        await this.applyDiffToStorage(userId, difference);

        io.isOfflineAvailable = true;
        await io.save();
    }

    /**
     * evaluates the storage used by an objects and removes this from the users used storage
     * @param userId
     * @param objectId
     * @param storage
     */
    async removeObjectFromUserStorage(userId: number, objectId: number, storage: StorageUtilization): Promise<void> {
        const io: ILIASObject = await ILIASObject.findByObjIdAndUserId(objectId, userId);
        if(!io.isOfflineAvailable) return;

        const difference: number = await storage.getUsedStorage(objectId, userId);
        const total: number = await this.getUsedStorage(userId);
        this.log.trace(() => `Remove object from storage, diff: ${difference} to total: ${total}, new storage usage: ${total + difference}`);
        if ((total + difference) < 0) {
            this.log.error(() => `User storage manager out of sync, total: ${total}, with diff: ${difference} is negative!`);
        }
        await this.applyDiffToStorage(userId, -difference);

        io.isOfflineAvailable = false;
        await io.save();
    }

    private async applyDiffToStorage(userId: number, difference: number): Promise<void> {
        this.log.debug(() => `storage: difference ${difference}`);
        const user: User = await User.find(userId);

        // Required, because this function gets called async multiple times.
        // Without the map, the calls would overwrite each others values.
        // Example: a -> read 1, b -> read 1 | a calc +2, b calc +5 | a write 3, b write 6 | database content 6 but should be 8
        if (!this.storageUsageByUser.has(userId)) {
            this.storageUsageByUser.set(userId, user.totalUsedStorage);
        }
        const oldTotal: number = this.storageUsageByUser.get(userId);
        const newTotal: number = Math.max(0, oldTotal + difference);
        this.storageUsageByUser.set(userId, newTotal);

        user.totalUsedStorage = newTotal;
        await user.save();
        this.log.debug(() => `storage: used ${user.totalUsedStorage}, by user with id: ${user.id}`);
    }
}
