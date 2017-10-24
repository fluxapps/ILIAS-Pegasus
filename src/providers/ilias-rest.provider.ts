import {Inject, Injectable} from '@angular/core';
import {Http, Headers, Response } from "@angular/http";
import {User} from "../models/user";
import {Log} from "../services/log.service";
import {ILIASConfig, ILIASInstallation} from "../config/ilias-config";
import {FileTransfer} from "@ionic-native/file-transfer";
import "rxjs/add/observable/defer";
import "rxjs/add/operator/timeout";
import {RESTAPIException} from "../exceptions/RESTAPIException";
import {ILIAS_CONFIG_FACTORY, ILIASConfigFactory} from "../services/ilias-config-factory";
import {isDefined} from "ionic-angular/es2015/util/util";

@Injectable()
export class ILIASRestProvider {

    constructor(
      @Inject(ILIAS_CONFIG_FACTORY) private readonly configFactory: ILIASConfigFactory,
      private readonly http: Http,
      private readonly transfer: FileTransfer
    ) {}

    private defaultTimeout = 20000;
    private api_url = '/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php';
    private api_version = 'v2';

    async getAuthToken(user: User, timeout: number = this.defaultTimeout): Promise<string> {

      const installation: ILIASInstallation = await this.getInstallation(user);

      try {

        const accessToken: string = await this.getAccessToken(user, installation);
        const endpoint: string = this.buildURL(installation.url, 'ilias-app/auth-token');

        const response: any = await this.httpGET(endpoint, accessToken);

        return Promise.resolve(response.token);

      } catch (error) {

        return Promise.reject(this.handleError(error, user, installation));
      }
    }

    async getDesktopData(user: User, timeout:number = null): Promise<Object[]> {

        const installation: ILIASInstallation = await this.getInstallation(user);

        try {

          const accessToken: string = await this.getAccessToken(user, installation);
          const endpoint: string = this.buildURL(installation.url, 'ilias-app/desktop');

          const response: any = await this.httpGET(endpoint, accessToken);

          return Promise.resolve(response);

        } catch (error) {
          return Promise.reject(this.handleError(error, user, installation));
        }
    }

    async getObjectData(parentRefId: number, user: User, recursive: boolean = false, timeout: number = null): Promise<Object[]> {

        const installation: ILIASInstallation = await this.getInstallation(user);

        try {

          const accessToken: string = await this.getAccessToken(user, installation);
          const restPath: string = (recursive)? `ilias-app/objects/${parentRefId}?recursive=1` : `ilias-app/objects/${parentRefId}`;
          const endpoint: string = this.buildURL(installation.url, restPath);

          const response: any = await this.httpGET(endpoint, accessToken);

          return Promise.resolve(response);

        } catch (error) {
          return Promise.reject(this.handleError(error, user, installation));
        }
    }


    /**
     * Get metadata of an ILIAS file object with the given refId
     * @param refId
     * @param user
     * @returns {Promise<Object>}
     */
    async getFileData(refId: number, user: User, timeout: number = null): Promise<Object> {

      const installation: ILIASInstallation = await this.getInstallation(user);

      try {

        const accessToken: string = await this.getAccessToken(user, installation);
        const endpoint: string = this.buildURL(installation.url, `ilias-app/files/${refId}`);

        const response: any = await this.httpGET(endpoint, accessToken);

        return Promise.resolve(response);

      } catch (error) {
        return Promise.reject(this.handleError(error, user, installation));
      }
    }


    async downloadFile(refId: number, storageLocation: string, user: User, progressListener = null, timeout = null): Promise<any> {

      const installation: ILIASInstallation = await this.getInstallation(user);

      try {

        const accessToken: string = await this.getAccessToken(user, installation);
        const endpoint: string = this.buildURL(installation.url, `files/${refId}`, "v1");

        const transfer = this.transfer.create();

        if (progressListener != null) {
          transfer.onProgress(progressListener);
        }

        Log.describe(this, "Downloading from: ", endpoint);
        Log.describe(this, "Downloading to: ", storageLocation);

        const headers: Headers = new Headers();
        headers.append("Authorization", `Bearer ${accessToken}`);

        return transfer.download(endpoint, storageLocation, false, {headers: headers});

      } catch (error) {
        return Promise.reject(this.handleError(error, user, installation));
      }
    }

    private async getInstallation(user: User): Promise<ILIASInstallation> {

      const config: ILIASConfig = await this.configFactory.get();

      const installation: ILIASInstallation | undefined = config.installations
        .find(installation => { return installation.id == user.installationId });

      if (isDefined(installation)) {
        return Promise.resolve(installation);
      }

      return Promise.reject("The user has no valid installation ID!");
    }

    private async updateAccessToken(user: User, installation: ILIASInstallation): Promise<User> {

      try {

        const endpoint: string = this.buildURL(installation.url, "oauth2/token", "v2");

        const response: Response = await this.http.post(endpoint, null).timeout(this.defaultTimeout).toPromise();

        const data: any = response.json();
        user.accessToken = data.access_token;
        user.refreshToken = data.refresh_token;
        user.lastTokenUpdate = Date.now();

        await user.save();

        return Promise.resolve(user);

      } catch (error) {
        return Promise.reject(new RESTAPIException(error))
      }
    }

    private async httpGET(url: string, accessToken: string): Promise<any> {

      try {

        const headers: Headers = new Headers();
        headers.append("Authorization", `Bearer ${accessToken}`);

        const response: Response = await this.http.get(url, {headers: headers})
          .timeout(this.defaultTimeout)
          .toPromise();

        return Promise.resolve(response.json());

      } catch (error) {
        return Promise.reject(error);
      }
    }

    private async getAccessToken(user: User, installation: ILIASInstallation): Promise<string> {

      if (!isStillValid(user.lastTokenUpdate, installation.accessTokenTTL)) {
        await this.updateAccessToken(user, installation);
      }

      return Promise.resolve(user.accessToken);

      function  isStillValid(updatedAt: number, timeToLife: number): boolean {
        return Date.now() - updatedAt < (timeToLife * 1000); // timeToLife is in seconds, so we convert them to milliseconds
      }
    }

    private async handleError(error, user: User, installation: ILIASInstallation): Promise<RESTAPIException> {

      Log.error(this, error);

      if (isDefined(error.status) && error.status == 401) {
        await this.updateAccessToken(user, installation);
      }

      return Promise.resolve(new RESTAPIException(error));
    }

    private buildURL(host: string, restPath: string, apiVersion = this.api_version): string {
      return encodeURI(`${host}${this.api_url}/${apiVersion}/${restPath}`);
    }
}
