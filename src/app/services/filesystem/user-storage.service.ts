import {DirectoryEntry, File, Flags, Entry} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable} from "@angular/core";
import {AuthenticationProvider} from "../../providers/authentication.provider";
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
export class UserStorageService {
    private static storageDifferences: Array<{userId: number, difference: number}> = [];
    private static storageUpdateLock: boolean = false;

    constructor(
        private readonly fileSystem: File,
        private readonly platform: Platform,
    ) {}

    /**
     * total used storage for a given user, as registered in the database
     * @param userId
     */
    static async getUsedStorage(userId: number): Promise<number> {
        const user: User = await User.find(userId);
        return user.totalUsedStorage;
    }

    /**
     * computes the total storage with a time consuming method in the background
     * for a given user and sets the corresponding property in the database
     * @param userId
     * @param fileSystem
     */
    async computeUsedStorage(userId: number, fileSystem: File): Promise<number> {
        const user: User = await User.find(userId);
        const dir: string = await this.getStorageLocation();
        let size: number = 0;

        const dirs: Array<string> = [`${dir}${userId}`, `${dir}user${userId}`];

        for(let i: number = 0; i<dirs.length; i++) {
            try {
                size += await UserStorageService.getDirSizeRecursive(dirs[i], fileSystem);
            } catch (e) {
                console.error(`Unable to get size of ${dirs[i]} : ${e.message}`)
            }
        }
        user.totalUsedStorage = size;
        await user.save();
        return size;
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
        await UserStorageService.addDifferenceToUserStorage(userId, difference);

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
        await UserStorageService.addDifferenceToUserStorage(userId, -difference);

        io.isOfflineAvailable = false;
        await io.save();
    }

    /**
     * applies a difference in storage to the total used storage of the specified user
     * @param userId
     * @param difference
     */
    static async addDifferenceToUserStorage(userId: number, difference: number) {
        UserStorageService.storageDifferences.push({userId: userId, difference: difference});
        if (!UserStorageService.storageUpdateLock)
            this.applyDifferenceToUserStorage();
    }

    /**
     * used to serialize writes of the total used storage
     */
    static async applyDifferenceToUserStorage() {
        UserStorageService.storageUpdateLock = true;
        while(UserStorageService.storageDifferences.length) {
            const entry: {userId: number, difference: number} = UserStorageService.storageDifferences.pop();
            console.log(`storage: difference ${entry.difference}`);
            const user: User = await User.find(entry.userId);
            user.totalUsedStorage = Number(user.totalUsedStorage) + Number(entry.difference);
            await user.save();
            console.log(`storage: used ${user.totalUsedStorage} by ${user.id}`);
        }
        UserStorageService.storageUpdateLock = false;
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

    /**
     * Constructs a path for a given directory that is unique for each combination of user and ILIAS-installation
     *
     * @param name name of the directory
     * @param createRecursive when set to true, will create the target directory if it does not exist yet
     */
    async dirForUser(name: string, createRecursive: boolean = false): Promise<string> {
        const storageLocation: string = await this.getStorageLocation();
        const userRoot: string = await this.rootForUser();
        if(createRecursive) this.createRecursive(storageLocation, userRoot, name);
        return `${storageLocation}${userRoot}/${name}/`;
    }

    /**
     * Constructs an unique path for each combination of user and ILIAS-installation
     */
    async rootForUser(): Promise<string> {
        const user: User = AuthenticationProvider.getUser();
        return `ilias-app/user${user.id.toString()}`;
    }

    /**
     * @returns {Promise<string>} the storage location considering the platform
     */
    async getStorageLocation(): Promise<string> {
        await this.platform.ready();
        if(this.platform.is("android")) {
            return this.fileSystem.externalApplicationStorageDirectory;
        } else if (this.platform.is("ios")) {
            return this.fileSystem.dataDirectory;
        }

        throw new Error("Unsupported platform. Can not return a storage location.");
    }

    /**
     * Creates the given directory structure.
     * If a directory exists already it will not be replaced.
     *
     * @param {string} first - initial directory, which must exist already
     * @param {string} more - sub-directories with format "subdir1/subdir2/..." which will be created if not existing
     *
     * @returns {Promise<string>} the created directory path excluding {@code first}
     */
    async createRecursive(first: string, ...more: Array<string>): Promise<string> {
        let previousDir: DirectoryEntry = await this.fileSystem.resolveDirectoryUrl(first);
        for(const currentDirs of more) {
            for(const currentDir of currentDirs.split("/"))
                previousDir = await this.fileSystem.getDirectory(previousDir, currentDir, <Flags>{create: true});
        }

        return `${more.join("/")}/`;
    }

    /**
     * moves a directory from an old location to a new one, replacing the directory at the new location, if it already exists
     */
    async moveAndReplaceDir(path: string, dirName: string, newPath: string, newDirName: string, copy: boolean = false): Promise<boolean> {
        try {
            try {
                await this.fileSystem.removeRecursively(newPath, newDirName);
            } catch(e) {
                console.warn(`Unable to remove ${newPath}|${newDirName} resulted in error ${e.message} continue...`);
            } finally {
                if(copy) await this.fileSystem.copyDir(path, dirName, newPath, newDirName);
                else await this.fileSystem.moveDir(path, dirName, newPath, newDirName);
            }
            return true;
        } catch(e) {
            console.warn(`Unable to move and replace ${path}|${dirName} => ${newPath}|${newDirName} resulted in error ${e.message}`);
            return false;
        }
    }

    /**
     * removes a directory
     */
    async removeDir(path: string, dirName: string): Promise<boolean> {
        try {
            await this.fileSystem.removeRecursively(path, dirName);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * removes a file
     *
     * @param path is the path to the file with format 'dir' or 'dir/'
     * @param fileName is the name of the file
     */
    async removeFileIfExists(path: string, fileName: string): Promise<boolean> {
        try {
            await this.fileSystem.removeFile(path, fileName);
            return true;
        } catch(e) {
            return false;
        }
    }
}
