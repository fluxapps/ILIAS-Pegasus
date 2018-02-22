import {HttpClient, HttpResponse, RequestOptions} from "../http";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {
  ClientCredentials,
  OAUTH2_DATA_SUPPLIER, OAuth2DataSupplier, OAuth2Token, TOKEN_RESPONSE_CONSUMER,
  TokenResponseConsumer
} from "./ilias.rest-api";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";

const MILLISEC_TO_SEC: number = 1000;

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
export const TOKEN_MANAGER: InjectionToken<TokenManager> = new InjectionToken("token for token manager");

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
 * @version 1.1.0
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

  /**
   * Performs a post request to the given {@code path} with the given {@code body}
   * as the http request body.
   *
   * @param {string} path - the endpoint without host and specific path
   * @param {object} body - the request body
   * @param {ILIASRequestOptions} options - ILIAS specific request options
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throw {TokenExpiredError} if the access token is expired and could not be refreshed
   */
  post(path: string, body: object, options: ILIASRequestOptions): Promise<HttpResponse>;
}
export const ILIAS_REST: InjectionToken<ILIASRest> = new InjectionToken("token for ILIAS rest");

/**
 * Manages credentials provided by the given {@link OAuth2DataSupplier}.
 *
 * The given {@link TokenResponseConsumer} is called on successful access token refresh.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
@Injectable()
 export class ILIASTokenManager implements TokenManager {

   private readonly log: Logger = Logging.getLogger(ILIASTokenManager.name);

   constructor(
     private readonly httpClient: HttpClient,
     @Inject(OAUTH2_DATA_SUPPLIER) private readonly dataSupplier: OAuth2DataSupplier,
     @Inject(TOKEN_RESPONSE_CONSUMER) private readonly responseConsumer: TokenResponseConsumer
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

       const credentials: ClientCredentials = await this.dataSupplier.getClientCredentials();

       this.log.info(() => "Validate access token");
       const token: string | undefined = await this.takeIf<string>(credentials.token.accessToken, (): boolean =>
         Date.now() / MILLISEC_TO_SEC - credentials.token.lastAccessTokenUpdate < credentials.token.accessTokenTTL
       );

       return this.orElseGet<string>(token, (): Promise<string> => this.updateAccessToken(credentials));

     } catch (error) {
       throw new TokenExpiredError("Could not get a valid access token");
     }
   }


  /**
   * Returns the given {@code object} if the given {@code condition} is true.
   *
   * @param {T} object - the object to check
   * @param {() => boolean} condition - the condition to use
   *
   * @returns {Promise<T | undefined>} the object if the condition is true, otherwise undefined
   */
   private async takeIf<T>(object: T, condition: () => boolean): Promise<T| undefined> {

      if (condition()) {
        return object
      }

      return undefined;
   }

  /**
   * Returns the given {@code object} or the given {@code supplier} if the object is undefined.
   *
   * @param {T | undefined} object - the object to get
   * @param {() => Promise<T>} supplier - the supplier to use
   *
   * @returns {Promise<T>} the resulting object
   */
   private async orElseGet<T>(object: T | undefined, supplier: () => Promise<T>): Promise<T> {

     if (isUndefined(object)) {
       return supplier();
     }

     return object
   }

  /**
   * Refreshes the access token by the refresh token and returns it.
   * The given arguments are used to get all relevant data to update
   * the access token.
   *
   * This method calls the {@link TokenResponseConsumer} on successful update.
   *
   * @param {ClientCredentials} credentials - the credentials to use
   *
   * @returns {Promise<string>} the updated access token
   * @throws {HttpRequestError} if the response is not ok
   */
   private async updateAccessToken(credentials: ClientCredentials): Promise<string> {

     const headers: Array<[string, string]> = [
       ["api_key", credentials.clientId],
       ["api_secret", credentials.clientSecret],
       ["grant_type", "refresh_token"],
       ["refresh_token", credentials.token.refreshToken]
     ];

     this.log.info(() => "Refresh access token by refresh token");
     const response: HttpResponse = await this.httpClient.post(credentials.accessTokenURL, undefined, <RequestOptions>{headers: headers});

     return response.handle<Promise<string>>(async(it): Promise<string> => {
       const data: OAuth2Token = it.json<OAuth2Token>(oAuthTokenSchema);
       await this.responseConsumer.accept(data);

       return data.access_token;
     });
   }
}

/**
 * Implementation of {@link ILIASRest}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
@Injectable()
 export class ILIASRestImpl implements ILIASRest {

   constructor(
     @Inject(TOKEN_MANAGER) private readonly tokenManager: TokenManager,
     @Inject(OAUTH2_DATA_SUPPLIER) private readonly dataSupplier: OAuth2DataSupplier,
     private readonly httpClient: HttpClient,
   ) {}

  /**
   * Performs a get request to the given {@code path}.
   *
   * The path MUST start with a '/' character.
   * The api version MUST be part of the path.
   *
   * @param {string} path the endpoint without host, specific path
   * @param {ILIASRequestOptions} options ILIAS specific request options
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throws {TokenExpiredError} if the access token is expired and could not be refreshed
   */
  async get(path: string, options: ILIASRequestOptions): Promise<HttpResponse> {
    return this.request(path, options, (url: string, opt: RequestOptions) => this.httpClient.get(url, opt));
  }

  /**
   * Performs a post request to the given {@code path} with the given {@code body}
   * as the http request body.
   *
   * The path MUST start with a '/' character.
   * The api version MUST be part of the path.
   *
   * @param {string} path - the endpoint without host and specific path
   * @param {object} body - the request body
   * @param {ILIASRequestOptions} options - ILIAS specific request options
   *
   * @returns {Promise<HttpResponse>} the resulting response
   * @throw {TokenExpiredError} if the access token is expired and could not be refreshed
   */
  async post(path: string, body: object, options: ILIASRequestOptions): Promise<HttpResponse> {
    return this.request(path, options, (url: string, opt: RequestOptions) => this.httpClient.post(url, JSON.stringify(body), opt));
  }

  /**
   * Sets up a http request by creating the complete url and the requests options.
   *
   * @param {string} path - the path to create the url for
   * @param {ILIASRequestOptions} options - the requests options to use
   * @param {RequestExecutor} executor - function called with the complete url and the request options
   *
   * @returns {Promise<HttpResponse>} the return value of the given {@code executor}
   */
  private async request(path: string, options: ILIASRequestOptions, executor: RequestExecutor): Promise<HttpResponse> {

    const credentials: ClientCredentials = await this.dataSupplier.getClientCredentials();

    const url: string = `${credentials.apiURL}${path}`;
    const headers: Array<[string, string]> = [
      ["accept", options.accept],
      ["Authorization", `${credentials.token.type} ${await this.tokenManager.getAccessToken()}`]
    ];

    const requestOptions: RequestOptions = <RequestOptions>{
      headers:headers,
      urlParams: options.urlParams
    };

    return executor(url, requestOptions);
  }
}

// type pointer for the private #request method of ILIASRestImpl
interface RequestExecutor { (url: string, options: RequestOptions): Promise<HttpResponse> }

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
  readonly accept: string,
  readonly urlParams?: Array<[string, string]>
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
