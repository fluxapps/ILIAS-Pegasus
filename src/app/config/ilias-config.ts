/** angular */
import {Injectable, InjectionToken} from "@angular/core";
/** misc */
import {HttpClient, HttpResponse} from "../providers/http";
import {isDefined} from "../util/util.function";

const CONFIG_FILE: string = "./assets/config.json";

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
  readonly privacyPolicy: string;
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
     private readonly http: HttpClient
   ) {
      this.config = this.loadFile();
   }

  async loadConfig(): Promise<ILIASConfig> { return this.config }

  async loadInstallation(installationId: number): Promise<Readonly<ILIASInstallation>> {

    const iliasConfig: ILIASConfig = await this.config;

    let installation: ILIASInstallation | undefined = iliasConfig.installations
      .find(it => it.id == installationId);

    installation = {
      id: installation.id,
      title: installation.title,
      url: installation.url,
      clientId: installation.clientId,
      apiKey: installation.apiKey,
      apiSecret: installation.apiSecret,
      accessTokenTTL: installation.accessTokenTTL,
      privacyPolicy: installation.privacyPolicy ? installation.privacyPolicy : "https://www.ilias-pegasus.de/datenschutz/"
    };

    if (isDefined(installation)) {
      return installation;
    }

    throw new ReferenceError(`Installation with id '${installationId}' does not exists in file: ${CONFIG_FILE}`);
  }

  private async loadFile(): Promise<ILIASConfig> {
    const response: HttpResponse = await this.http.get(CONFIG_FILE);

    return response.json<ILIASConfig>(configSchema);
  }
}

const configSchema: object = {
  "title": "config",
  "type": "object",
  "properties": {
    "installations": {
      "type": "array",
      "items:": {
        "type": "object",
        "properties": {
          "id": {
            "type": "number",
            "min": 1
          },
          "title": {"type": "string"},
          "url": {"type": "string"},
          "clientId": {"type": "string"},
          "apiKey": {"type": "string"},
          "apiSecret": {"type": "string"},
          "accessTokenTTL": {"type": "number"},
          "privacyPolicy": {
            "type": "string",
            "default": "https://www.ilias-pegasus.de/datenschutz/"
          }
        },
        "required": ["id", "title", "url", "clientId", "apiKey", "apiSecret", "accessTokenTTL"]
      }
    }
  },
  "required": ["installations"]
};
