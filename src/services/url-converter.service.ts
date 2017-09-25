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
   * @param {ILIASLink} link the link to convert
   * @returns {Promise<string>} the resulting url
   */
  convert(link: ILIASLink): Promise<string>
}

/**
 * {@link TokenUrlConverter} converts u url to an url
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
   * @param {ILIASLink} link the link to convert
   * @returns {Promise<string>} the resulting url
   */
  convert(link: ILIASLink): Promise<string> {

    let userId = 0;

    return User.currentUser()
      .then(user => {
        userId = user.iliasUserId;
        return this.restProvider.getAuthToken(user);
      })
      .then(tokenObject => {

        const view = ILIASLinkView[link.view].toLowerCase();
        const url = `${link.host}/goto.php?target=ilias_app_auth|${userId}|${link.refId}|${view}|${tokenObject.token}`;

        return Promise.resolve(url);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }
}

/**
 * Data class containing information for a link to ILIAS.
 */
export class ILIASLink {

  readonly host: string;
  readonly refId: number;
  readonly originalUrl: string;

  /**
   * Extracts the host and the ref id from the given {@code url}.
   *
   * @param {string} url a link to ILIAS, must contain 'target'
   *                  as request parameter with the ref id as value, prefixed ref id is possible
   *                  e.g. https://ilias.de/goto.php?target=crs_67 or https://ilias.de/goto.php?target=67
   * @param {string} view the wanted view of the of the object
   */
  constructor(
    url: string,
    readonly view: ILIASLinkView = ILIASLinkView.DEFAULT
  ) {

    const pattern: RegExp = new RegExp("(http(?:s?):\\/\\/.*)\\/.*target=[a-z_]*(\\d+)");
    const matches: string[] = pattern.exec(url);

    // TODO: Check for matches
    this.host = matches[1];
    this.refId = parseInt(matches[2], 10);
    this.originalUrl = url;
  }
}

/**
 * All views for an {@link ILIASLinkView}, that are supported
 * by the {@link TokenUrlConverter}.
 */
export enum ILIASLinkView {
  DEFAULT,
  TIMELINE
}
