import {Inject, Injectable, InjectionToken} from "@angular/core";
import {CONFIG_PROVIDER, ConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {UserEntity} from "../../entity/user.entity";
import {Optional} from "../../util/util.optional";
import {NoSuchElementError} from "../../error/errors";
import {ILIASRestProvider} from "../../providers/ilias-rest.provider";
import {User} from "../../models/user";
import {RESTAPIException} from "../../exceptions/RESTAPIException";

/**
 * The installation news supplier, supplies the currently used ILIAS installation
 * url.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface InstallationLinkSupplier {

  /**
   * Fetches the ILIAS installation path of the current user.
   *
   * @returns {Promise<string>} The found installation url.
   *
   * @throws ReferenceError     Thrown if the installation was not found.
   * @throws NoSuchElementError Thrown if no user is authenticated.
   */
  get(): Promise<string>;
}

export const INSTALLATION_LINK_PROVIDER: InjectionToken<InstallationLinkSupplier> = new InjectionToken("token for installation link supplier");

/**
 * The token supplier provides a valid token for authentication with the help of the
 * ILIAS Pegasus helper plugin.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface TokenSupplier {

  /**
   * Requests a valid authentication token.
   *
   * @returns {Promise<string>} Valid token for authentication.
   *
   * @throws RESTAPIException   Thrown if the auth token request failed.
   */
  get(): Promise<string>;
}

export const TOKEN_SUPPLIER: InjectionToken<TokenSupplier> = new InjectionToken("token for authentication token supplier");

/**
 * Default implementation of an installation link supplier.
 * The installation url is fetch, by the currently authenticated user installation id.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
@Injectable()
export class InstallationLinkSupplierImpl implements InstallationLinkSupplier {

  constructor(
    @Inject(CONFIG_PROVIDER) private readonly configProvider: ConfigProvider,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  /**
   *
   * @returns {Promise<string>} The installation id.
   *
   * @throws ReferenceError     Thrown if the installation was not found.
   * @throws NoSuchElementError Thrown if no user is authenticated.
   */
  async get(): Promise<string> {
    const user: Optional<UserEntity> = await this.userRepository.findAuthenticatedUser();
    if(user.isPresent()) {
      const installation: ILIASInstallation = await this.configProvider.loadInstallation(user.get().installationId);
      return installation.url;
    }
    else
      throw new NoSuchElementError("No authenticated user found.");
  }
}

/**
 * Supplies short living ILIAS SOO auth tokens.
 * Which are used for a onetime authentication of a user.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export class AuthTokenSupplier implements TokenSupplier {

  private static readonly REQUEST_TIMEOUT: number = 6000; //six seconds.

  constructor(private readonly restProvider: ILIASRestProvider
  ) {}


  /**
   * Supplies a short living ILIAS SSO token.
   *
   * @returns {Promise<string>} The auth token which can be used to authenticate the user.
   *
   * @throws RESTAPIException   Thrown if the auth token request failed.
   */
  async get(): Promise<string> {
    return this.restProvider.getAuthToken(await User.currentUser(), AuthTokenSupplier.REQUEST_TIMEOUT);
  }

}
