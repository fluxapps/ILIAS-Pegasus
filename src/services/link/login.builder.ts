
import {Builder} from "../builder.base";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {INSTALLATION_LINK_PROVIDER, InstallationLinkSupplier} from "./link-builder.supplier";

/**
 * Builds links to the pegasus login page.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface LoginLinkBuilder extends Builder<Promise<string>> {

}

export const LOGIN_LINK_BUILDER: InjectionToken<LoginLinkBuilder> = new InjectionToken("token for login link builder");

@Injectable()
export class LoginLinkBuilderImpl implements LoginLinkBuilder {

  constructor(
    @Inject(INSTALLATION_LINK_PROVIDER) private readonly installationLinkSupplier: InstallationLinkSupplier
  ) {}

  /**
   * Build the custom login page link for the pegasus.
   *
   * @returns {Promise<string>} The login link which points to the selected installation.
   */
  async build(): Promise<string> {
    const installation: string = await this.installationLinkSupplier.get();
    return `${installation}/goto.php?target=ilias_app_login_page`;
  }
}

