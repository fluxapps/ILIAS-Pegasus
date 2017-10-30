import {ILIASConfig} from "../config/ilias-config";
import {Injectable, InjectionToken} from "@angular/core";
import {isArray, isNumber, isString, isUndefined} from "ionic-angular/es2015/util/util";
import {Http, Response} from "@angular/http";
import {ILIASInstallation} from "../config/ilias-config";

export const ILIAS_CONFIG_FACTORY = new InjectionToken<ILIASConfigFactory>("ilias-config-factory");

/**
 * Describes a factory to initialize the config.json file.
 *
 * @author nmaerchy
 * @version 1.0.0
 */

export interface ILIASConfigFactory {

  /**
   * The instance returned is always the same.
   *
   * @returns {ILIASConfig} a loaded ILIAS config
   */
  get(): Promise<ILIASConfig>
}

@Injectable()
export class HttpILIASConfigFactory implements ILIASConfigFactory {

  private static readonly  configFile = "assets/config.json";

  private config: Promise<ILIASConfig>;

  constructor(
    private readonly http: Http
  ) {
    this.config = this.loadConfig()
  }

  /**
   * Loads the config.json file and parses it into a {@link ILIASConfig} class.
   * The instance returned is always be the same.
   *
   * @returns {ILIASConfig} a loaded ILIAS config
   */
  async get(): Promise<ILIASConfig> { return this.config; }

  private async loadConfig(): Promise<ILIASConfig> {

    const installations: Array<ILIASInstallation> = await this.loadInstallations();

    return <ILIASConfig> {
      installations: installations
    };
  }

  private async loadInstallations(): Promise<Array<ILIASInstallation>> {

    const response: Response = await this.http.get(HttpILIASConfigFactory.configFile).toPromise();
    const body: object = response.json();

    const installations: Array<object> = this.getArray(body, "installations");

    return installations.map(installation => {

      return <ILIASInstallation>{
        id: this.getNumber(installation, "id"),
        title: this.getString(installation, "title"),
        url: this.getString(installation, "url"),
        clientId: this.getString(installation, "clientId"),
        apiKey: this.getString(installation, "apiKey"),
        apiSecret: this.getString(installation, "apiSecret"),
        accessTokenTTL: this.getNumber(installation, "accessTokenTTL")
      };
    });
  }

  private getString(object: object, property: string): string {

    const prop: any = this.getProperty(object, property);

    if (!isString(prop)) {
      throw new TypeError(`Can not parse config file '${HttpILIASConfigFactory.configFile}': property '${property}' is not a string`);
    }

    return prop;
  }

  private getNumber(object: object, property: string): number {

    const prop: any = this.getProperty(object, property);

    if (!isNumber(prop)) {
      throw new TypeError(`Can not parse config file '${HttpILIASConfigFactory.configFile}': property '${property}' is not a number`);
    }

    return prop;
  }

  private getArray(object: object, property: string): Array<object> {

    const prop: any = this.getProperty(object, property);

    if (!isArray(prop)) {
      throw new TypeError(`Can not parse config file '${HttpILIASConfigFactory.configFile}': property '${property}' is not an array`);
    }

    return prop;
  }

  private getProperty(object: object, property: string): any {

    const prop: any = object[property];

    if (isUndefined(prop)) {
      throw new TypeError(`Can not parse config file '${HttpILIASConfigFactory.configFile}': property '${property}' is undefined`);
    }

    return prop;
  }
}
