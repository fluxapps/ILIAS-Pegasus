/** angular */
import {Inject, Injectable} from "@angular/core";
/** misc */
import {
    ClientCredentials,
    OAuth2DataSupplier,
    OAuth2Token,
    Token,
    TokenResponseConsumer
} from "../providers/ilias/ilias.rest-api";
import {User} from "../models/user";
import {CONFIG_PROVIDER, ConfigProvider, ILIASInstallation} from "./ilias-config";
import {AuthenticationProvider} from "../providers/authentication.provider";

const apiURL: string = "/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php";

/**
 * Provides the credentials data to ILIAS rest.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable({
    providedIn: "root"
})
export class Oauth2DataSupplierImpl implements OAuth2DataSupplier{

    constructor(
        @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider
    ) {}

    /**
     * Loads the current user and gets the installation of him.
     *
     * Last Token update is converted from milliseconds to seconds.
     *
     * @returns {Promise<ClientCredentials>} the client credentials that should be used
     */
    async getClientCredentials(): Promise<ClientCredentials> {

        const currentUser: User = AuthenticationProvider.getUser();
        const installation: ILIASInstallation = await this.configProvider.loadInstallation(currentUser.installationId);

        return <ClientCredentials>{
            clientId: installation.apiKey,
            clientSecret: installation.apiSecret,
            apiURL: `${installation.url}${apiURL}`,
            accessTokenURL: `${installation.url}${apiURL}/v2/oauth2/token`,
            token: <Token>{
                type: "Bearer",
                accessToken: currentUser.accessToken,
                refreshToken: currentUser.refreshToken,
                lastAccessTokenUpdate: currentUser.lastTokenUpdate / 1000,
                accessTokenTTL: installation.accessTokenTTL
            }
        }
    }
}

/**
 * Consumes the token response from ILIAS rest.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable({
    providedIn: "root"
})
export class TokenResponseConsumerImpl implements TokenResponseConsumer {

    constructor(
    ) {}

    /**
     * Store the given token data to the current user.
     *
     * @param {OAuth2Token} token   - the response of an access token url
     */
    async accept(token: OAuth2Token): Promise<void> {

        const currentUser: User = AuthenticationProvider.getUser();
        currentUser.lastTokenUpdate = Date.now();
        currentUser.accessToken = token.access_token;
        currentUser.refreshToken = token.refresh_token;

        await currentUser.save();
    }
}
