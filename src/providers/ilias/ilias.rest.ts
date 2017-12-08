import {HttpClient, HttpResponse} from "../http";
import {CONFIG_PROVIDER, ConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {Inject, Injectable} from "@angular/core";
import {User} from "../../models/user";
import {Headers, RequestOptionsArgs} from "@angular/http";

const FACTOR_SEC_TO_MILLI: number = 1000;
const ILIAS_API_URL: string = "/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php";

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
   * @throws {TokenExpiredError} if the access token is expired and could not be refreshed
   */
  get(path: string, options: ILIASRequestOptions): Promise<HttpResponse>;
}

/**
 * Manages an access token from the active user.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
 export class ILIASTokenManager implements TokenManager {

   constructor(
     private readonly httpClient: HttpClient,
     @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider,
     private readonly activeUser: ActiveUserProvider
   ) {}

  /**
   * Ensures that the returned access token is valid.
   * If the access token is expired, it will be refreshed.
   *
   * @returns {Promise<string>} the resulting access token
   * @throws {TokenExpiredError} if no valid access token can be used and the token can not be refreshed
   */
   async getAccessToken(): Promise<string> {

     try {

       const user: User = await this.activeUser.read();
       const installation: ILIASInstallation = await this.configProvider.loadInstallation(user.installationId);

       if (this.hasValidToken(user, installation.accessTokenTTL)) {
         return user.accessToken;
       }

       return this.updateAccessToken(user, installation);

     } catch (error) {
       throw new TokenExpiredError("Could not find a valid access token");
     }
   }

  /**
   * Refreshes the access token by the refresh token and returns it.
   * The given arguments are used to get all relevant data to update
   * the access token.
   *
   * The given {@code user} will be updated with the new access token.
   *
   * @param {User} user the user used
   * @param {ILIASInstallation} installation the ILIAS installation of the user
   *
   * @returns {Promise<string>} the updated access token
   * @throws {HttpRequestError} if the response is not ok
   */
   private async updateAccessToken(user: User, installation: ILIASInstallation): Promise<string> {

     const url: string = `${installation.url}${ILIAS_API_URL}/v2/oauth2/token`;

     const headers: Headers = new Headers();
     headers.append("api_key", installation.apiKey);
     headers.append("api_secret", installation.apiSecret);
     headers.append("grant_type", "refresh_token");
     headers.append("refresh_token", user.refreshToken);

     const response: HttpResponse = await this.httpClient.post(url, undefined, {headers: headers});

     return response.handle(async(it): Promise<string> => {
       const data: OAuthToken = it.json<OAuthToken>(oAuthTokenSchema);
       await this.updateTokens(user, data);

       return data.access_token;
     });
   }

  /**
   * Checks if the given {@code user} has a valid access token
   * by comparing the users last token update with the given {@code ttl}.
   *
   * @param {User} user the user to check the token
   * @param {number} ttl time to life of the access token in seconds
   *
   * @returns {boolean} true if the token is valid, otherwise false
   */
   private hasValidToken(user: User, ttl: number): boolean {
     return Date.now() - user.lastTokenUpdate < ttl * FACTOR_SEC_TO_MILLI;
   }

  /**
   * Updates the tokens on the given {@code user}
   * and persists the changes.
   *
   * @param {User} user the user to update
   * @param {OAuthToken} data the token data
   */
   private async updateTokens(user: User, data: OAuthToken): Promise<void> {
     user.accessToken = data.access_token;
     user.refreshToken = data.refresh_token;
     user.lastTokenUpdate = Date.now();
     await this.activeUser.write(user);
   }
}

/**
 * Implementation of {@link ILIASRest}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
 export class ILIASRestImpl implements ILIASRest {

   constructor(
     private readonly tokenManager: TokenManager,
     private readonly configProvider: ConfigProvider,
     private readonly httpClient: HttpClient,
     private readonly activeUser: ActiveUserProvider
   ) {}

  /**
   * Performs a get request to the given {@code path}.
   * The path MUST start with a '/' character.
   *
   * The api version MUST NOT be part of the path. Instead its required in the
   * {@code options} parameter.
   *
   * @param {string} path the endpoint without host, specific path and api version
   * @param {ILIASRequestOptions} options ILIAS specific request options
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throws {TokenExpiredError} if the access token is expired and could not be refreshed
   */
  async get(path: string, options: ILIASRequestOptions): Promise<HttpResponse> {

     const user: User = await this.activeUser.read();
     const installation: ILIASInstallation = await this.configProvider.loadInstallation(user.installationId);

     const url: string = `${installation.url}${ILIAS_API_URL}/${options.apiVersion}${path}`;
     const headers: Headers = new Headers();
     headers.append("Authorization", `Bearer ${this.tokenManager.getAccessToken()}`);


     const requestOptions: RequestOptionsArgs = <RequestOptionsArgs>{
       headers:headers,
       search: options.urlParams
     };

     return this.httpClient.get(url, requestOptions);
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
 * Json response on OAuth2 authentication.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
interface OAuthToken {
   readonly access_token: string;
   readonly refresh_token: string;
   readonly expires_in: number;
   readonly token_type: string;
}

const oAuthTokenSchema: object = {
  "title": "oauth2 token",
  "type": "object",
  "properties": {
    "access_token": { "type": "string" },
    "refresh_token": { "type": "string" },
    "expires_in": { "type": "integer" },
    "token_type": { "type": "string" }
  },
  "required": ["access_token", "refresh_token", "expires_in", "token_type"]
};

/**
 * request options for ILIAS.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ILIASRequestOptions {
  readonly apiVersion: ILIASApiVersion,
  readonly urlParams?: URLSearchParams
}

/**
 * Indicates an expired token.
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
