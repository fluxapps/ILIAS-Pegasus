import {Injectable} from "@angular/core";
import {User} from "../../models/user";
import {ILIASObject} from "../../models/ilias-object";

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
    private static storageDifferences: Array<{userId: number, difference: number}> = [];
    private static storageUpdateLock: boolean = false;

    /**
     * total used storage for a given user, as registered in the database
     * @param userId
     */
    static async getUsedStorage(userId: number): Promise<number> {
        const user: User = await User.find(userId);
        return user.totalUsedStorage;
    }

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
        await UserStorageMamager.addDifferenceToUserStorage(userId, difference);

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
        await UserStorageMamager.addDifferenceToUserStorage(userId, -difference);

        io.isOfflineAvailable = false;
        await io.save();
    }

    /**
     * applies a difference in storage to the total used storage of the specified user
     * @param userId
     * @param difference
     */
    static async addDifferenceToUserStorage(userId: number, difference: number) {
        UserStorageMamager.storageDifferences.push({userId: userId, difference: difference});
        if (!UserStorageMamager.storageUpdateLock)
            this.applyDifferenceToUserStorage();
    }

    /**
     * used to serialize writes of the total used storage
     */
    static async applyDifferenceToUserStorage() {
        UserStorageMamager.storageUpdateLock = true;
        while(UserStorageMamager.storageDifferences.length) {
            const entry: {userId: number, difference: number} = UserStorageMamager.storageDifferences.pop();
            console.log(`storage: difference ${entry.difference}`);
            const user: User = await User.find(entry.userId);
            user.totalUsedStorage = Number(user.totalUsedStorage) + Number(entry.difference);
            await user.save();
            console.log(`storage: used ${user.totalUsedStorage} by ${user.id}`);
        }
        UserStorageMamager.storageUpdateLock = false;
    }
}
