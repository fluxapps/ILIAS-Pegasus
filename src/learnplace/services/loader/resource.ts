import {DirectoryEntry, File, Flags, IWriteOptions, FileWriter, FileEntry, FileError} from "@ionic-native/file";
import {IllegalStateError} from "../../../error/errors";
import {HttpClient, HttpResponse} from "../../../providers/http";
import {LINK_BUILDER, LinkBuilder} from "../../../services/link/link-builder.service";
import {Platform} from "ionic-angular";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";

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
    private readonly file: File,
    private readonly http: HttpClient,
    @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
    private readonly platform: Platform,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
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

      const response: HttpResponse = await this.http.get(url);

      const storageLocation: string = await this.getStorageLocation();

      const user: UserEntity = (await this.userRepository.findAuthenticatedUser()).get();
      const path: string = await this.createRecursive(storageLocation, "ilias-app", user.id.toString(), "lernorte");

      this.log.trace(() => `Save file "${name}" to location "${storageLocation}${path}"`);
      await this.writeFileJunked(response.arrayBuffer(), `${storageLocation}${path}`, name);

      return `${path}${name}`;

    } catch (error) {
      this.log.debug(() => `Resource Transfer Error: ${JSON.stringify(error)}`);
      throw new ResourceLoadError(`Could not transfer resource: resource=${resource}`);
    }
  }

    /**
     * Write content in 5MB junks to the file.
     * This is necessary due to ram spike issues while writing large files (base64 encode at the cordova js nativ exec call bridge),
     * which leads to an instant crash of the app.
     *
     * @param {ArrayBuffer} fileContent
     * @param {string} path
     * @param {string} name
     * @returns {Promise<void>}
     */
    private async writeFileJunked(fileContent: ArrayBuffer, path: string, name: string): Promise<void> {
        const blockSize: number = 5 * 1024**2; //5MB
        const writeCycles: number = Math.floor(fileContent.byteLength / blockSize);

        this.log.trace(() => `Writing file with block-size: ${blockSize}, cycles: ${writeCycles} total-size: ${fileContent.byteLength}`);
        const fileEntry: FileEntry = await this.file.writeFile(path, name, "", <IWriteOptions>{ replace: true });

        for(let i: number = 0; i <= writeCycles; i++) {
            //start byte pointer
            const blockPointer: number = i * blockSize;

            //the end pointer is equal to the start + block size or the data which are left at the end of the file.
            const blockPointerEnd: number = (blockSize <= (fileContent.byteLength - blockPointer))
                ? blockPointer + blockSize
                : fileContent.byteLength;

            this.log.trace(() => `Writing file block ${i} start ${blockPointer} end ${blockPointerEnd}`);
            await this.writeFileJunk(fileContent.slice(blockPointer, blockPointerEnd), fileEntry, blockPointer);
        }
    }

    private async writeFileJunk(slice: ArrayBuffer, file: FileEntry, blockPosition: number): Promise<void> {
        return new Promise<void>((resolve: Resolve<void>, reject: Reject<Error>) => {
            file.createWriter((writer: FileWriter) => {

                writer.onerror = (event: ProgressEvent): void => {reject(new Error("Unable to write file."))};
                writer.onwriteend = (event: ProgressEvent): void => resolve();
                writer.seek(blockPosition);
                writer.write(slice);

            }, (error: FileError) => {
                reject(new IllegalStateError(`Unable to write file with FileError: ${error.code} and message ${error.message}`));
            });
        });
    }

  /**
   * @returns {Promise<string>} the storage location considering the platform
   */
  private async getStorageLocation(): Promise<string> {

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
