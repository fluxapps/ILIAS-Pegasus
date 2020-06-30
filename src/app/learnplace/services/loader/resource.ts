import {Inject, Injectable, InjectionToken} from "@angular/core";
import {DirectoryEntry, File, Flags} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {UserEntity} from "../../../entity/user.entity";
import {DownloadRequestOptions, FILE_DOWNLOADER, FileDownloader} from "../../../providers/file-transfer/file-download";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {LINK_BUILDER, LinkBuilder} from "../../../services/link/link-builder.service";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";



/**
 * Builds directory paths for learnplaces.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplacePathBuilder {

    /**
     * Crate the learnplace path and returns relative path to the learnplace folder.
     * This method will ensure that the path exists.
     *
     * @param {number} userId   The pegasus user id. (Not ILIAS user id)
     *
     * @returns {Promise<string>} The absolute path to the learnplace folder of the gîven user.
     */
    createPath(userId: number): Promise<string>;

    /**
     * The base storage location based on the platform the app is running on.
     *
     * @returns {Promise<string>}   The storage dependant location.
     */
    getStorageLocation(): Promise<string>;
}

export const LEARNPLACE_PATH_BUILDER: InjectionToken<LearnplacePathBuilder> = new InjectionToken("token for learnplace path builder");

@Injectable()
export class LearnplacePathBuilderImpl implements LearnplacePathBuilder {

    private readonly log: Logger = Logging.getLogger(LearnplacePathBuilderImpl.name);

    constructor(
        private readonly file: File,
        private readonly platform: Platform,
    ) {}


    async createPath(userId: number): Promise<string> {
        const storageLocation: string = await this.getStorageLocation();
        return this.createRecursive(storageLocation, "ilias-app", userId.toString(), "lernorte");
    }

    /**
     * @returns {Promise<string>} the storage location considering the platform
     */
    async getStorageLocation(): Promise<string> {

        if (this.platform.is("android")) {
            this.log.trace(() => "Platform Android detected");
            return this.file.externalApplicationStorageDirectory;
        } else if (this.platform.is("ios")) {
            this.log.trace(() => "Platform ios detected");
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

/**
 * Describes a loader for resources, that loads AND saves a resource.
 * A {@link ResourceTransfer} must know where to store the resource by itself.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ResourceTransfer {

  /**
   * Loads and stores the given resource.
   * This method does know the host address to build the complete url of the resource.
   *
   * @param {string} resource - a relative path to the resource
   *
   * @returns {Promise<string>} the local absolute path to the stored resource
   * @throws {ResourceLoadError} if the transfer fails
   */
  transfer(resource: string): Promise<string>
}
export const RESOURCE_TRANSFER: InjectionToken<string> = new InjectionToken("token for resource transfer");

/**
 * Resource loader over a http connection.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
@Injectable()
export class HttpResourceTransfer implements ResourceTransfer {

  private readonly log: Logger = Logging.getLogger(HttpResourceTransfer.name);

  constructor(
    @Inject(LEARNPLACE_PATH_BUILDER) private readonly pathBuilder: LearnplacePathBuilder,
    @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(FILE_DOWNLOADER) private readonly downloader: FileDownloader
  ) {}

  /**
   * Loads and stores the given resource.
   * This method does know the host address to build the complete url of the resource
   * by using a {@link LinkBuilder}.
   *
   * @param {string} resource - a relative path to the resource
   *
   * @returns {Promise<string>} the local absolute path to the stored resource
   * @throws {ResourceLoadError} if the transfer fails
   */
  async transfer(resource: string): Promise<string> {

    try {

      this.log.trace(() => `Read filename of ${resource}`);
      const resourceFragments: Array<string> = resource.split("/");
      const name: string = resourceFragments.pop();

      const url: string = await this.linkBuilder
        .resource()
        .resource(resource)
        .build();

      const storageLocation: string = await this.pathBuilder.getStorageLocation();

      const user: UserEntity = (await this.userRepository.findAuthenticatedUser()).get();
      const path: string = await this.pathBuilder.createPath(user.id);

      this.log.trace(() => `Save file "${name}" to location "${storageLocation}${path}"`);
      const downloadOptions: DownloadRequestOptions = <DownloadRequestOptions>{
            url: url,
            filePath: `${storageLocation}${path}${name}`,
            body: "",
            followRedirects: true,
            headers: {},
            timeout: 0
        };

      await this.downloader.download(downloadOptions);

      return `${path}${name}`;

    } catch (error) {
      this.log.debug(() => `Resource Transfer Error: ${JSON.stringify(error)}`);
      throw new ResourceLoadError(`Could not transfer resource: resource=${resource}`);
    }
  }


}

/**
 * Indicates that an resource could not be loaded.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class ResourceLoadError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ResourceLoadError.prototype);
  }
}
