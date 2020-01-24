import { FileEntry, RemoveResult } from "@ionic-native/file/ngx";
import { InjectionToken } from "@angular/core";

/**
 * OS independent filesystem interface.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
export interface Filesystem {
    /**
     * Tries to open the given path in the standard application.
     *
     * @param {string} path - File path.
     * @param {string|undefined} type? - The file type for example "application/pdf"
     * @return {Promise<void>} - Resolves after the open operation is complete.
     */
    open(path: string, type?: string): Promise<void>;

    /**
     * Checks whether the filepath exists or not.
     *
     * @param {string} path - The path which should get checked.
     * @return {Promise<boolean>} Returns true if the path exists, otherwise false.
     */
    exists(path: string): Promise<boolean>;

    /**
     * Delete a file or directory.
     *
     * This method ignores non existent paths!
     *
     * @param {string} path - The path which should get deleted.
     * @return {Promise<void>} Resolves after the operation is complete.
     */
    delete(path: string): Promise<RemoveResult>;

    /**
     * Creates or updates a file.
     * If the directory path is not existent, it will be created.
     *
     * Existing files will be overwritten!
     *
     * @param {string} path - The path of the file.
     * @param {ArrayBuffer} data - The data which should be written to the file.
     * @return {Promise<FileEntry>} - A file handel which points to the created or modified file.
     *
     * @throws {Error} Throws if the path is not accessible.
     */
    save(path: string, data: ArrayBuffer): Promise<FileEntry>;
}

export const FILESYSTEM_TOKEN: InjectionToken<Filesystem> = new InjectionToken<Filesystem>("Filesystem service injection token.");
