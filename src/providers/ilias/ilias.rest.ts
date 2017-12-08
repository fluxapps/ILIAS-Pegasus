import {HttpClient, HttpResponse} from "../http";
import {CONFIG_PROVIDER, ConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {Inject, Injectable} from "@angular/core";
import {User} from "../../models/user";
import {Headers} from "@angular/http";

// console.log(HttpClient);
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
export interface TokenManager {

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
  get(path: string, options: ILIASRequestOptions): Promise<HttpResponse>;
}

/**
 * Manages an access token from the active user.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
 export class ILIASTokenManager implements TokenManager {

   private accessToken: string = "";

   constructor(
     private readonly httpClient: HttpClient,
     @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider,
     private readonly activeUser: ActiveUserProvider
   ) {}

   async getAccessToken(): Promise<string> {

     const user: User = await this.activeUser.read();
     const installation: ILIASInstallation = await this.configProvider.loadInstallation(user.installationId);

     if (Date.now() - user.lastTokenUpdate < (installation.accessTokenTTL * 1000)) {
       return user.accessToken;
     }

     const url: string = installation.url + "/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php/v2/oauth2/token";

     const headers: Headers = new Headers();
     headers.append("api_key", installation.apiKey);
     headers.append("api_secret", installation.apiSecret);
     headers.append("grant_type", "refresh_token");
     headers.append("refresh_token", user.refreshToken);

     const response: HttpResponse = await this.httpClient.post(url, undefined, {headers: headers})

     const data: any = response.json({});
     user.accessToken = data.access_token;
     user.refreshToken = data.refres_token;
     user.lastTokenUpdate = Date.now();
     await this.activeUser.write(user);

     return data.access_token;
   }
}

/**
 * Abstract the User Active Record to operate and only operate on the active user.
 *
 * Is needed for testing purposes.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
 export class ActiveUserProvider {

   async read(): Promise<User> { return User.findActiveUser() }

   async write(user: User): Promise<void> { await user.save() }
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
