import {ILIASConfig} from "./ilias-config";
import {Http, Response} from "@angular/http";
import {isDefined} from "ionic-angular/es2015/util/util";
import {Injectable, InjectionToken} from "@angular/core";

const CONFIG_FILE: string = "assets/config.json";

export interface ILIASConfig {
  readonly installations: Array<ILIASInstallation>
}

export interface ILIASInstallation {
  readonly id: number;
  readonly title: string;
  readonly url: string;
  readonly clientId: string;
  readonly apiKey: string;
  readonly apiSecret: string;
  readonly accessTokenTTL: number;
}

export const CONFIG_PROVIDER: InjectionToken<ConfigProvider> = new InjectionToken<ConfigProvider>("Token for ConfigProvider");

/**
 * Describes a provider for the config file of this app.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ConfigProvider {

  /**
   * Loads the config file.
   *
   * @returns {Promise<ILIASConfig>} the resulting
   */
  loadConfig(): Promise<ILIASConfig>

  /**
   * Loads the config file and searches for an installation
   * matching the given {@code installationId}.
   *
   * @param {number} installationId unique identifier of the installation
   *
   * @returns {Promise<ILIASInstallation>} the resulting ILIAS installation
   * @throw {ReferenceError} if the given id does not exists
   */
  loadInstallation(installationId: number): Promise<ILIASInstallation>
}

/**
 * Provider for the config file. The file is loaded over angular {@link Http}.
 * This class assumes, that the config file is valid.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
 export class ILIASConfigProvider implements ConfigProvider {

  private readonly config: Promise<ILIASConfig>;

   constructor(
     private readonly http: Http
   ) {
      this.config = this.loadFile();
   }

  async loadConfig(): Promise<ILIASConfig> { return this.config }

  async loadInstallation(installationId: number): Promise<ILIASInstallation> {

     const iliasConfig: ILIASConfig = await this.config;

    const installation: ILIASInstallation | undefined = iliasConfig.installations
      .find(it => it.id == installationId);

    if (isDefined(installation)) {
      return installation;
    }

    throw new ReferenceError(`Installation with id '${installationId}' does not exists in file: ${CONFIG_FILE}`);
  }

  private async loadFile(): Promise<ILIASConfig> {
    const response: Response = await this.http.get(CONFIG_FILE).toPromise();

    return response.json();
  }
}
