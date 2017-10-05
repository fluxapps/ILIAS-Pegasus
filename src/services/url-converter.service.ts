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
   * @param {ILIASLinkBuilder} linkBuilder the builder to get an {@link ILIASLink}
   * @returns {Promise<string>} the resulting url
   */
  convert(linkBuilder: ILIASLinkBuilder): Promise<string>
}

/**
 * {@link TokenUrlConverter} converts an link to an url
 * that can be used for sign in and redirect in ILIAS.
 *
 * A token will be get over the {@link ILIASRestProvider}.
 */
@Injectable()
export class TokenUrlConverter implements UrlConverter{

  public constructor(
    private readonly restProvider: ILIASRestProvider
  ) {}

  /**
   * Converts the given {@code link} to a specific url, that can be used
   * by the ILIAS Pegasus Helper Plugin.
   *
   * @see https://github.com/studer-raimann/PegasusHelper
   *
   * If the given {@link ILIASLinkBuilder} can not build a {@link ILIASLink},
   * the unconverted url will be returned.
   *
   * @param {ILIASLinkBuilder} linkBuilder the builder to get an {@link ILIASLink}
   * @returns {Promise<string>} the resulting url
   */
  convert(linkBuilder: ILIASLinkBuilder): Promise<string> {

    let userId = 0;

    return User.currentUser()
      .then(user => {
        userId = user.iliasUserId;
        return this.restProvider.getAuthToken(user);
      })
      .then(tokenObject => {

        if (linkBuilder.validate()) {

          const link = linkBuilder.build();

          const view = ILIASLinkView[link.view].toLowerCase();
          const url = `${link.host}/goto.php?target=ilias_app_auth|${userId}|${link.refId}|${view}|${tokenObject.token}`;

          return Promise.resolve(url);
        }

        return Promise.resolve(linkBuilder.url);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }
}

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

    const matches: string[] = this.pattern.exec(this.url);

    return new ILIASLink(
      matches[1],
      parseInt(matches[2], 10),
      this.view
    )
  }
}

/**
 * Data class containing information for a link to ILIAS.
 */
class ILIASLink {
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
