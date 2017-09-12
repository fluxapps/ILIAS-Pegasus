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

    let userid = 0;

    return User.currentUser()
      .then(user => {
        userid = user.iliasUserId;
        return this.restProvider.getAuthToken(user);
      })
      .then(tokenObject => {

        const view = link.view.toString().toLowerCase();
        const url = `${link.host}/goto.php?target=ilias_app_auth|${userid}|${link.refId}|${view}|${tokenObject.token}`;

        return Promise.resolve(url);
      })
      .catch(error => {
        return Promise.reject(error);
      });
  }

  public rewrite(link: string): Promise<string> {

    let userId = 0;

    return User.currentUser()
      .then(user => {
        userId = user.iliasUserId;
        return this.restProvider.getAuthToken(user);
      })
      .then(tokenObject => {

        const pattern: RegExp = new RegExp("(http(?:s?):\\/\\/.*)\\/.*_(\\d+)");
        const matches: string[] = pattern.exec(link);

        // TODO: Check for matches
        const host: string = matches[1];
        const refId: string = matches[2];

        const url: string = `${host}/goto.php?target=ilias_app_auth|${userId}|${refId}|${tokenObject.token}`;

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
