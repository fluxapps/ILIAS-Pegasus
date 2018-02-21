
import {Builder} from "../builder.base";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {INSTALLATION_LINK_PROVIDER, InstallationLinkSupplier} from "./link-builder.supplier";

/**
 * Builds links to the pegasus loading page.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface LoadingLinkBuilder extends Builder<Promise<string>> {

}

export const LOADING_LINK_BUILDER: InjectionToken<() => LoadingLinkBuilder> = new InjectionToken("token for loading link builder factory");

@Injectable()
export class LoadingLinkBuilderImpl implements LoadingLinkBuilder {

  constructor(
    @Inject(INSTALLATION_LINK_PROVIDER) private readonly installationLinkSupplier: InstallationLinkSupplier
  ) {}

  /**
   * Build the loading page link for the pegasus redirects.
   *
   * @returns {Promise<string>} The loading link which points to the selected installation.
   */
  async build(): Promise<string> {
    const installation: string = await this.installationLinkSupplier.get();
    return `${installation}/goto.php?target=ilias_app_login_page`;
  }
}

