import {DirectoryEntry, File, Flags} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Injectable} from "@angular/core";
import {AuthenticationProvider} from "../providers/authentication.provider";
import {User} from "../models/user";

@Injectable({
    providedIn: "root"
})
export class LocalStorageService {
    constructor(
        private readonly file: File,
        private readonly platform: Platform,
    ) {}


    async createDirForUser(name: string): Promise<string> {
        const user: User = AuthenticationProvider.getUser();
        const storageLocation: string = await this.getStorageLocation();
        return this.createRecursive(storageLocation, "ilias-app", user.id.toString(), name);
    }

    /**
     * @returns {Promise<string>} the storage location considering the platform
     */
    async getStorageLocation(): Promise<string> {
        if (this.platform.is("android")) {
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
     * @param {string} more - sub-directories which will be created if not exist
     *
     * @returns {Promise<string>} the created directory path excluding {@code first}
     */
    private async createRecursive(first: string, ...more: Array<string>): Promise<string> {
        let previousDir: DirectoryEntry = await this.file.resolveDirectoryUrl(first);
        for(const currentDir of more) {
            previousDir = await this.file.getDirectory(previousDir, currentDir, <Flags>{create: true});
        }

        return `${more.join("/")}/`;
    }
}
