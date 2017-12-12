import {Injectable, InjectionToken} from "@angular/core";

/**
 * Describes a supplier for data needed for {@link ILIASRest}.
 *
 * Implement this interface to provide a supplier for the
 * OAuth 2 data, that are used in {@code ILIASRest}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface OAuth2DataSupplier {

  /**
   * @returns {Promise<ClientCredentials>} the client credentials that should be used
   */
   getClientCredentials(): Promise<ClientCredentials>
}
export const OAUTH2_DATA_SUPPLIER: InjectionToken<OAuth2DataSupplier> = new InjectionToken("oauth2 data supplier");

/**
 * Describes a consumer, that will be called when the response
 * of a access token url is resolved.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export interface TokenResponseConsumer {

  /**
   * Performs this operation on the given argument.
   *
   * @param {OAuth2Token} token   - the response of an access token url
   */
  accept(token: OAuth2Token): Promise<void>
}
export const TOKEN_RESPONSE_CONSUMER: InjectionToken<TokenResponseConsumer> = new InjectionToken("token response consumer");

/**
 * Default implementation of a {@link TokenResponseConsumer}.
 *
 * This implementation does nothing and can be used, if no operation
 * should be executed.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
 export class DefaultTokenResponseConsumer implements TokenResponseConsumer {
  accept(token: OAuth2Token): Promise<void> { return Promise.resolve() }
}

/**
 * Data object for client credentials.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 *
 * @property {string} clientId        - the client id of the ILIAS api
 * @property {string} clientSecret    - the secret of the ILIAS api
 * @property {string} accessTokenURL  - the url to get the access token
 * @property {Token} token            - The token values
 */
export interface ClientCredentials {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly accessTokenURL: string;
  readonly token: Token;
}

/**
 * Data object for the token data of oauth 2.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 *
 * @property {string} type          - the token type used, e.g. Bearer
 * @property {string} accessToken   - the access token value
 * @property {string} refreshToken  - the refresh token value
 * @property {lastTokenUpdate}      - unix time of the last token update in seconds
 * @property {ttl}                  - time to life of the token in seconds
 */
export interface Token {
  readonly type: string;
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly lastTokenUpdate: number;
  readonly ttl: number;
}

/**
 * Data object for the token response in Oauth 2.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 *
 * @property {string} access_token    - the access token value
 * @property {string} refresh_token   - the refresh token value
 * @property {number} expires_in      - the expire time of the access token in seconds
 * @property {string} token_type      - the access token type e.g. bearer
 */
export interface OAuth2Token {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}
