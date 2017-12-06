import {HttpResponse} from "../http";
import {User} from "../../models/user";

/**
 * Supported API versions.
 */
export type ILIASApiVersion = "v1" | "v2";

/**
 * Describes a manager to validate authentication tokens.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface TokeManager {

  /**
   * Ensures that the returned access token is valid.
   *
   * @returns {Promise<string>} the resulting access token
   * @throws {TokenExpiredError} if no valid access token can be used
   */
  getAccessToken(): Promise<string>
}

/**
 * Describes a REST client specialized for ILIAS.
 *
 * An ILIAS REST endpoint is accessed over a host and a specific url path,
 * before the actual endpoint is used. An implementation of this interface
 * MUST manage the host and the specific url path itself, so only
 * the actual endpoint can be used.
 *
 * e.g. endpoint with all values
 * https://ilias.de/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php/actual/endpoint
 *
 * An implementation manages the following part of the uri:
 * https://ilias.de/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php
 *
 * Endpoints used in the methods of this interface:
 * /actual/endpoint
 *
 * In addition, the authentication process, if needed, MUST be handled
 * by the implementation as well.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ILIASRest {

  /**
   * Performs a get request to the given {@code path}.
   *
   * @param {string} path the endpoint without host and specific path
   * @param {ILIASRequestOptions} options ILIAS specific request options
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throws {HttpRequestError} if the request was not successful
   * @throws {AuthenticateError} if the request could not be authenticated
   */
  get(path: string, options: ILIASRequestOptions): Promise<HttpResponse>
}

/**
 * Abstracts the {@link User} Active Record as a repository,
 * that only can get the active user.
 *
 * Is necessary for testing purposes, which is not possible with the RDM pattern.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
 export class ActiveUserRepository {

   async get(): Promise<User> { return User.findActiveUser() }

   async save(user: User): Promise<void> { await user.save() }
 }

/**
 * Describes request options for ILIAS.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ILIASRequestOptions {
  readonly apiVersion: ILIASApiVersion,
  readonly urlParams?: URLSearchParams
}

/**
 * Indicates, that a authentication token is expired.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class TokenExpiredError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}
