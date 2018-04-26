import {Builder} from "../builder.base";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {INSTALLATION_LINK_PROVIDER, InstallationLinkSupplier, TOKEN_SUPPLIER, TokenSupplier} from "./link-builder.supplier";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {UserEntity} from "../../entity/user.entity";
import {isString} from "util";

/**
 * Build arbitrary links to ILIAS resources like pictures and videos.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface ResourceLinkBuilder extends Builder<Promise<string>>{

  /**
   * Sets the path to the ILIAS resource.
   *
   * @param {string} path           The relative path of the ILIAS resource which should be linked.
   * @returns {DefaultLinkBuilder}  The builder it self to chain the builder method calls.
   */
  resource(path: string): ResourceLinkBuilder;
}

export const RESOURCE_LINK_BUILDER: InjectionToken<() => ResourceLinkBuilder> = new InjectionToken("token for the resource link builder factory");

@Injectable()
export class ResourceLinkBuilderImpl implements ResourceLinkBuilder {

  private path: string = "";

  constructor(
    @Inject(INSTALLATION_LINK_PROVIDER) private readonly installationLinkSupplier: InstallationLinkSupplier,
    @Inject(TOKEN_SUPPLIER) private readonly tokenSupplier: TokenSupplier,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {
  }

  /**
   * Sets the relative ILIAS resource path.
   *
   * @param {string} path           The relative ILIAS resource path.
   * @returns {DefaultLinkBuilder}  The builder it self to chain the builder method calls.
   */
  resource(path: string): ResourceLinkBuilder {
    this.path = path;
    return this;
  }

  /**
   * Generates a valid auth token and builds the ILIAS resource link.
   *
   * @returns {Promise<string>} The complete ILIAS object link with auth token.
   * @throws {IllegalStateError} Thrown if the builder needs more data to build the link.
   */
  async build(): Promise<string> {
    this.validateBuilderState();

    const user: UserEntity = (await this.userRepository.findAuthenticatedUser())
      .orElseThrow(() => new NoSuchElementError("No authenticated user found, unable to build resource ILIAS link."));

    const token: string = await this.tokenSupplier.get();
    const installation: string = await this.installationLinkSupplier.get();
    return `${installation}/${this.path}?user=${user.iliasUserId}&token=${token}&target=ilias_app_resource`;
  }

  /**
   * Validates the state of the builder.
   * If the builder is not ready for the build state
   * an error will be thrown.
   */
  private validateBuilderState(): void {
    if(this.path === "" || isString(this.path) !== true)
      throw new IllegalStateError("Required resource path was not found, ILIAS resource link build failed.");
  }
}
