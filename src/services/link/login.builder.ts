
import {Builder} from "../builder.base";
import {Injectable, InjectionToken} from "@angular/core";
import {IllegalStateError} from "../../error/errors";

/**
 * Builds links to the pegasus login page.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface LoginLinkBuilder extends Builder<string> {

  /**
   * Sets the installation url which should be used to build the login page link.
   *
   * @param {string} url          The installation url for example "https://ilias.de"
   * @returns {LoginLinkBuilder}  The builder it self for fluent call chaining.
   */
  installation(url: string): LoginLinkBuilder;

  /**
   * Sets the client id of the installation.
   *
   * @param {string} id           The client id which should be used, for example default.
   * @returns {LoginLinkBuilder}  The builder it self for fluent call chaining.
   */
  clientId(id: string): LoginLinkBuilder;

}

export const LOGIN_LINK_BUILDER: InjectionToken<LoginLinkBuilder> = new InjectionToken("token for login link builder");

@Injectable()
export class LoginLinkBuilderImpl implements LoginLinkBuilder {

  private installationUrl: string = "";
  private clientIdentifier: string = "";

  /**
   * Sets the installation url which should be used to build the login page link.
   *
   * @param {string} url          The installation url for example "https://ilias.de"
   * @returns {LoginLinkBuilder}  The builder it self for fluent call chaining.
   */
  installation(url: string): LoginLinkBuilder {
    this.installationUrl = url;
    return this;
  }

  /**
   * Sets the client id of the installation.
   *
   * @param {string} id           The client id which should be used, for example default.
   * @returns {LoginLinkBuilder}  The builder it self for fluent call chaining.
   */
  clientId(id: string): LoginLinkBuilder {
    this.clientIdentifier = id;
    return this;
  }

  /**
   * Build the login page link for the pegasus redirects.
   *
   * @returns {Promise<string>} The login link which points to the selected installation.
   * @throws {IllegalStateError} Thrown if the builder needs more data to build the link.
   */
  build(): string {
    this.validateBuilderState();

    return `${this.installationUrl}/login.php?target=ilias_app_login_page&client_id=${this.clientIdentifier}`;
  }

  /**
   * Validates the state of the builder.
   * If the builder is not ready for the build state
   * an error will be thrown.
   */
  private validateBuilderState(): void {
    if(this.installationUrl === "")
      throw new IllegalStateError("Required installation was not found, ILIAS login link build failed.");
    if(this.clientIdentifier === "")
      throw new IllegalStateError("Required client id was not found, ILIAS login link build failed.");
  }
}
