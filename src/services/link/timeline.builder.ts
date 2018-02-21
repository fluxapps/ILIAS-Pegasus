import {INSTALLATION_LINK_PROVIDER, InstallationLinkSupplier, TOKEN_SUPPLIER, TokenSupplier} from "./link-builder.supplier";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {Builder} from "../builder.base";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {UserEntity} from "../../entity/user.entity";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";

/**
 * The time-line link builder, creates a link to an arbitrary ILIAS time-line enabled container object, for example a course.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface TimelineLinkBuilder extends Builder<Promise<string>> {
  target(refId: number): TimelineLinkBuilder;
}

export const TIMELINE_LINK_BUILDER: InjectionToken<() => TimelineLinkBuilder> = new InjectionToken("token for timeline link builder factory");

/**
 * The time-line link builder, creates a link to an arbitrary ILIAS time-line enabled container object, for example a course.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
@Injectable()
export class TimelineLinkBuilderImpl implements TimelineLinkBuilder {

  private refId: number = -1;

  constructor(
    @Inject(INSTALLATION_LINK_PROVIDER) private readonly installationLinkSupplier: InstallationLinkSupplier,
    @Inject(TOKEN_SUPPLIER) private readonly tokenSupplier: TokenSupplier,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}


  /**
   * Set the ILIAS link target ref id.
   *
   * @param {number} refId
   * @returns {TimelineLinkBuilder}
   */
  target(refId: number): TimelineLinkBuilder {
    this.refId = refId;
    return this;
  }


  /**
   * Build the timeline ILIAS link.
   *
   * @returns {Promise<string>} The ILIAS timeline link.
   *
   * @throws IllegalStateError  Thrown if the builder is not ready to build the link.
   */
  async build(): Promise<string> {

    this.validateBuilderState();

    const user: UserEntity = (await this.userRepository.findAuthenticatedUser())
      .orElseThrow(() => new NoSuchElementError("No authenticated user found, unable to build timeline ILIAS link."));

    const token: string = await this.tokenSupplier.get();
    const installation: string = await this.installationLinkSupplier.get();
    return `${installation}/goto.php?target=ilias_app_auth|${user.iliasUserId}|${this.refId}|timeline|${token}`;
  }

  /**
   * Validates the state of the builder.
   * If the builder is not ready for the build state
   * an error will be thrown.
   */
  private validateBuilderState(): void {
    if(this.refId <= 0)
      throw new IllegalStateError("Required ref id was not found, ILIAS timeline link build failed.");
  }
}
