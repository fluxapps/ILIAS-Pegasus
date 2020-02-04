import {DirectoryEntry, File, Flags} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable} from "@angular/core";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {User} from "../../models/user";
import {LearningModule} from "../../models/learning-module";

@Injectable({
    providedIn: "root"
})
export class UserStorageService {
    constructor(
        private readonly file: File,
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
        if(this.platform.is("android")) {
            return this.file.externalApplicationStorageDirectory;
        } else if (this.platform.is("ios")) {
            return this.file.dataDirectory;
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
        let previousDir: DirectoryEntry = await this.file.resolveDirectoryUrl(first);
        for(const currentDirs of more) {
            for(const currentDir of currentDirs.split("/"))
                previousDir = await this.file.getDirectory(previousDir, currentDir, <Flags>{create: true});
        }

        return `${more.join("/")}/`;
    }

    /**
     * moves a directory from an old location to a new one, replacing the directory at the new location, if it already exists
     */
    async moveAndReplaceDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<boolean> {
        try {
            try {
                await this.file.removeRecursively(newPath, newDirName);
            } finally {
                await this.file.moveDir(path, dirName, newPath, newDirName);
            }
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
            await this.file.removeFile(path, fileName);
            return true;
        } catch(e) {
            return false;
        }
    }
}
