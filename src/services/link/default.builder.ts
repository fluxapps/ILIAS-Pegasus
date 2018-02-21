import {Builder} from "../builder.base";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {INSTALLATION_LINK_PROVIDER, InstallationLinkSupplier, TOKEN_SUPPLIER, TokenSupplier} from "./link-builder.supplier";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {UserEntity} from "../../entity/user.entity";

/**
 * Build arbitrary links to ILIAS objects.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface DefaultLinkBuilder extends Builder<Promise<string>>{

  /**
   * Sets the target ILIAS ref id of the link.
   *
   * @param {number} refId          The ref id of the ILIAS object which should be linked.
   * @returns {DefaultLinkBuilder}  The builder it self to chain the builder method calls.
   */
  target(refId: number): DefaultLinkBuilder;
}

export const DEFAULT_LINK_BUILDER: InjectionToken<() => DefaultLinkBuilder> = new InjectionToken("token for the default link builder factory");

@Injectable()
export class DefaultLinkBuilderImpl implements DefaultLinkBuilder {

  private refId: number = -1;

  constructor(
    @Inject(INSTALLATION_LINK_PROVIDER) private readonly installationLinkSupplier: InstallationLinkSupplier,
    @Inject(TOKEN_SUPPLIER) private readonly tokenSupplier: TokenSupplier,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {
  }

  /**
   * Sets the target ILIAS ref id of the link.
   *
   * @param {number} refId          The ref id of the ILIAS object which should be linked.
   * @returns {DefaultLinkBuilder}  The builder it self to chain the builder method calls.
   */
  target(refId: number): DefaultLinkBuilder {
    this.refId = refId;
    return this;
  }

  /**
   * Generates a valid auth token and builds the default ILIAS object link.
   *
   * @returns {Promise<string>} The complete ILIAS object link with auth token.
   */
  async build(): Promise<string> {
    this.validateBuilderState();

    const user: UserEntity = (await this.userRepository.findAuthenticatedUser())
      .orElseThrow(() => new NoSuchElementError("No authenticated user found, unable to build default ILIAS link."));

    const token: string = await this.tokenSupplier.get();
    const installation: string = await this.installationLinkSupplier.get();
    return `${installation}/goto.php?target=ilias_app_auth|${user.iliasUserId}|${this.refId}|default|${token}`;
  }

  /**
   * Validates the state of the builder.
   * If the builder is not ready for the build state
   * an error will be thrown.
   */
  private validateBuilderState(): void {
    if(this.refId <= 0)
      throw new IllegalStateError("Required ref id was not found, ILIAS default link build failed.");
  }
}
