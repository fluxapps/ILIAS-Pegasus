import {File, IWriteOptions} from "@ionic-native/file";
import {HttpClient, HttpResponse} from "../../../providers/http";
import {LinkBuilder} from "../../../services/link/link-builder.service";
import {Platform} from "ionic-angular";
import {UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";

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
   */
  transfer(resource: string): Promise<string>
}

/**
 * Resource loader over a http connection.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class HttpResourceTrasfer implements ResourceTransfer {

  private readonly log: Logger = Logging.getLogger(HttpResourceTrasfer.name);

  constructor(
    private readonly file: File,
    private readonly http: HttpClient,
    private readonly linkBuilder: LinkBuilder,
    private readonly platform: Platform,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Loads and stores the given resource.
   * This method does know the host address to build the complete url of the resource
   * by using a {@link LinkBuilder}.
   *
   * @param {string} resource - a relative path to the resource
   *
   * @returns {Promise<string>} the local absolute path to the stored resource
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

      this.log.trace(() => `Save file "${name}" to location "${storageLocation}"`);
      await this.file.writeFile(storageLocation, name, response.text(), <IWriteOptions>{replace: true});

      return `${storageLocation}${name}`;

    } catch (error) {
      this.log.debug(() => `Resource Transfer Error: ${JSON.stringify(error)}`);
      throw new ResourceLoadError(`Could not transfer resource: resource=${resource}`);
    }
  }

  private async getStorageLocation(): Promise<string> {

    const user: UserEntity = (await this.userRepository.findAuthenticatedUser()).get();

    if (this.platform.is("android")) {
      this.log.trace(() => "Platform Android detected");
      return `${this.file.externalApplicationStorageDirectory}/ilias-app/${user.id}/`;
    } else if (this.platform.is("ios")) {
      this.log.trace(() => "Platform ios detected");
      return `${this.file.dataDirectory}/${user.id}/`;
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
