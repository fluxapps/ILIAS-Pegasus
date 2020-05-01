import {Inject, Injectable, InjectionToken} from "@angular/core";
import {IOError} from "../../error/errors";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {PictureBlockEntity} from "../entity/pictureBlock.entity";
import {VideoBlockEntity} from "../entity/videoblock.entity";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {File, FileEntry, RemoveResult} from "@ionic-native/file/ngx";
import {LEARNPLACE_PATH_BUILDER, LearnplacePathBuilder} from "./loader/resource";
import {StorageUtilization} from "../../services/filesystem/user-storage.service";
import {LEARNPLACE_LOADER, LearnplaceLoader} from "./loader/learnplace";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {User} from "../../models/user";

/**
 * Describes a service to manage learnplaces.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceManager {

    /**
     * Loads all relevant data of the learnplace matching
     * the given {@code objectId} and stores them.
     *
     * @param {number} objectId - ILIAS object id of the learnplace
     *
     * @throws {LearnplaceLoadingError} if the learnplace could not be loaded
     */
    load(objectId: number): Promise<void>;

    /**
     * Removes the learnplace with the given id.
     * All stored files of the learnplace will be removed as well.
     *
     * @param {number} objectId The object id of the learnplace which should be removed.
     * @param {number} userId The id of the user which owns the learnplace. This id must not be confused with the ILIAS user id which is different.
     *
     * @returns {Promise<void>} Resolves if the removal was successful or rejects a corresponding error in case of failure.
     */
    remove(objectId: number, userId: number): Promise<void>;

    /**
     * Calculates the used storage of the learnplace.
     *
     * Caution: The used storage within the sqlite database is not included.
     *
     * @param {number} objectId The object id of the learnplace which should be calculated.
     * @param {number} userId The id of the user which owns the learnplace. This id must not be confused with the ILIAS user id which is different.
     *
     * @returns {Promise<number>} The used storage in bytes.
     */
    getUsedStorage(objectId: number, userId: number): Promise<number>;
}

export const LEARNPLACE_MANAGER: InjectionToken<LearnplaceManager> = new InjectionToken("token for learnplace manager.");

/**
 * Implementation of the learnplace manager interface.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class LearnplaceManagerImpl implements LearnplaceManager, StorageUtilization{

    private log: Logger = Logging.getLogger(LearnplaceManagerImpl.name);

    constructor(
        private readonly file: File,
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(LEARNPLACE_PATH_BUILDER) private readonly pathBuilder: LearnplacePathBuilder,
        @Inject(LEARNPLACE_LOADER) private readonly loader: LearnplaceLoader
    ){}

    async load(objectId: number): Promise<void> {
        await this.loader.load(objectId);
        const user: User = AuthenticationProvider.getUser();
        console.log(`DEV ADD STORAGE ${await this.getUsedStorage(objectId, user.id)}`);
    }


    async remove(objectId: number, userId: number): Promise<void> {
        console.log(`DEV REMOVE STORAGE ${await this.getUsedStorage(objectId, userId)}`);

        return (await this.learnplaceRepository.findByObjectIdAndUserId(objectId, userId)).ifPresent(async(it) => {

            const paths: Array<string> = [];
            const basePath: string = await this.pathBuilder.getStorageLocation();

            it.videoBlocks.forEach((video: VideoBlockEntity) => paths.push(`${basePath}${video.url}`));
            it.pictureBlocks.forEach((picture: PictureBlockEntity) => {
                paths.push(`${basePath}${picture.url}`);
                paths.push(`${basePath}${picture.thumbnail}`);
            });
            it.accordionBlocks.forEach((it) => {
                it.videoBlocks.forEach((video: VideoBlockEntity) => paths.push(`${basePath}${video.url}`));
                it.pictureBlocks.forEach((picture: PictureBlockEntity) => {
                    paths.push(`${basePath}${picture.url}`);
                    paths.push(`${basePath}${picture.thumbnail}`);
                });
            });

            let success: boolean = true;
            for(const fullPath of paths) {
                const [path, filename]: [string, string] = this.splitIntoPathNamePair(fullPath);
                const result: RemoveResult = await this.file.removeFile(path, filename);

                if(!result.success)
                    this.log.warn(() => `Unable to delete file "${fullPath}"`);

                success = success && result.success;
            }

            if(!success)
                throw new IOError(`Unable to delete all files of learnplace object id ${objectId} owned by user with id ${userId}`);

            await this.learnplaceRepository.delete(it);
        });
    }

    private splitIntoPathNamePair(path: string): [string, string] {
        const pathParts: Array<string> = path.split("/");
        const filename: string = pathParts.pop();
        const dirPath: string = pathParts.join("/");
        return [dirPath, filename];
    }

    async getUsedStorage(objectId: number, userId: number): Promise<number> {
         let size: number = 0;
         await (await this.learnplaceRepository.findByObjectIdAndUserId(objectId, userId)).ifPresent(async(it) => {

            const paths: Array<string> = [];
            const basePath: string = await this.pathBuilder.getStorageLocation();

            it.videoBlocks.forEach((video: VideoBlockEntity) => paths.push(`${basePath}${video.url}`));
            it.pictureBlocks.forEach((picture: PictureBlockEntity) => {
                paths.push(`${basePath}${picture.url}`);
                paths.push(`${basePath}${picture.thumbnail}`);
            });

            for(const fullPath of paths) {
                const [path, filename]: [string, string] = this.splitIntoPathNamePair(fullPath);
                const result: FileEntry = await this.file.getFile(await this.file.resolveDirectoryUrl(path), filename, {create: false});
                result.getMetadata(it => size += it.size);
            }
        });

         return size;
    }
}
