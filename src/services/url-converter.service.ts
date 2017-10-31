import {ILIASRestProvider} from "../providers/ilias-rest.provider";
import {User} from "../models/user";
import {Injectable} from "@angular/core";

/**
 * Describes a converter for a {@link ILIASLink}.
 */
export interface UrlConverter {

  /**
   * Converts the given {@code link}.
   *
   * @param {ILIASLinkBuilder} link the link object to convert the url
   * @returns {Promise<string>} the resulting url
   */
  convert(link: ILIASLink): Promise<string>
}

/**
 * {@link TokenUrlConverter} converts an link to an url
 * that can be used for sign in and redirect in ILIAS.
 *
 * A token will be get over the {@link ILIASRestProvider}.
 */
@Injectable()
export class TokenUrlConverter implements UrlConverter{

  constructor(
    private readonly restProvider: ILIASRestProvider
  ) {}

  /**
   * Converts the given {@code link} to a specific url, that can be used
   * by the ILIAS Pegasus Helper Plugin.
   *
   * @see https://github.com/studer-raimann/PegasusHelper
   *
   * @param {ILIASLink} link the link object to convert the url
   * @returns {Promise<string>} the resulting url
   */
  async convert(link: ILIASLink): Promise<string> {

    const user: User = await User.currentUser();
    const token: string = await this.restProvider.getAuthToken(user);

    const view: string = ILIASLinkView[link.view].toLowerCase();
    const url: string = `${link.host}/goto.php?target=ilias_app_auth|${user.iliasUserId}|${link.refId}|${view}|${token}`;

    return Promise.resolve(url);
  }
}

// Magic numbers used by ILIASLinkProvider
const REF_ID: number = 2;
const HOST: number = 1;
const BASE_10: number = 10;

/**
 * Builder class for an {@link ILIASLink}.
 *
 * This builder can only build links, if the provided url matches the regex.
 * The url must contain the ref id after the match [a-z_].
 * @example https://ilias.de/goto.php?target=crs_67 or https://ilias.de/goto_ilias_crs_67
 */
export class ILIASLinkBuilder {

  private readonly pattern: RegExp = new RegExp("(http(?:s?):\\/\\/.*)\\/.*[a-z_](\\d+)");

  /**
   * Creates an builder for a link to ILIAS.
   *
   * @param {string} url a link to ILIAS
   * @param {string} view the wanted view of the of the object
   */
  constructor(
    readonly url: string,
    readonly view: ILIASLinkView = ILIASLinkView.DEFAULT
  ) {}

  /**
   * Checks the url of this builder against the regex of this builder.
   *
   * @returns {boolean} true, if the url matches the regex, otherwise false
   */
  validate(): boolean { return this.pattern.test(this.url); }

  /**
   * Builds an {@link ILIASLink} by the url and the regex of this builder.
   * This methods calls the {@link ILIASLinkBuilder#validate} method before the build.
   *
   * @returns {ILIASLink} the resulting link object
   * @throws Error if the url does not match the regex of this builder
   */
  build(): ILIASLink {

    if (!this.validate()) {
      throw new Error(`Can not build link: url does not match regex, url=${this.url}`)
    }

    const matches: Array<string> = this.pattern.exec(this.url);

    return new ILIASLink(
      matches[HOST],
      parseInt(matches[REF_ID], BASE_10),
      this.view
    )
  }
}

/**
 * Data class containing information for a link to ILIAS.
 */
export class ILIASLink {
  constructor(
    readonly host: string,
    readonly refId: number,
    readonly view: ILIASLinkView
  ) {}
}

/**
 * All views for an {@link ILIASLinkView}, that are supported
 * by the {@link TokenUrlConverter}.
 */
export enum ILIASLinkView {
  DEFAULT,
  TIMELINE
}
