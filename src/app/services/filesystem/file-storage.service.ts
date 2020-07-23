import {DirectoryEntry, File, Flags} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable} from "@angular/core";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {User} from "../../models/user";

@Injectable({
    providedIn: "root"
})
export class FileStorageService {
    constructor(
        private readonly fileSystem: File,
        private readonly platform: Platform,
    ) {}

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
