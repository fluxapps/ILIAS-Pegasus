import {Inject, Injectable} from '@angular/core';
import {Http, Headers} from "@angular/http";
import {User} from "../models/user";
import {URLSearchParams} from '@angular/http'
import {Log} from "../services/log.service";
import {ILIASInstallation} from "../config/ilias-config";
import {FileTransfer} from "@ionic-native/file-transfer";
import {Events} from "ionic-angular";
import "rxjs/add/observable/defer";
import "rxjs/add/operator/timeout";
import {RESTAPIException} from "../exceptions/RESTAPIException";
import {ILIAS_CONFIG_FACTORY, ILIASConfigFactory} from "../services/ilias-config-factory";

@Injectable()
export class ILIASRestProvider {
    public constructor(
      private http: Http,
      @Inject(ILIAS_CONFIG_FACTORY)
      private readonly configFactory: ILIASConfigFactory,
      private readonly transfer: FileTransfer,
      protected event: Events) {
    }

    protected defaultTimeout = 20000;
    protected api_url = '/Customizing/global/plugins/Services/UIComponent/UserInterfaceHook/REST/api.php';
    protected app_routes_url = '/v2/';

    async getAuthToken(user: User, timeout: number = this.defaultTimeout): Promise<string> {

      try {
        const installation: ILIASInstallation = await this.getInstallation(user);
        await this.checkAndUpdateAccessToken(user, installation, timeout);

        const endpoint = installation.url + this.api_url + this.app_routes_url + 'ilias-app/auth-token';

        const token = await this.http.get(endpoint, {headers: this.getAuthHeaders(user)})
          .timeout(timeout)
          .map(response => response.json().token)
          .toPromise();

        return Promise.resolve(token);
      } catch (error) {
        Log.error(this, error);
        if (error.status && error.status == 401) {
          this.logout();
        }
        return Promise.reject(new RESTAPIException(error));
      }
}

    /**
     * Get ILIAS objects on desktop
     * @param user
     * @returns {Promise<Array<Object>>}
     */
    public getDesktopData(user: User, timeout:number = null): Promise<Object[]> {

        let installation;

        return this.getInstallation(user)
            .then(insta => {
                installation = insta;
                return this.checkAndUpdateAccessToken(user, installation, timeout);
            })
            .then(() => {
                Log.describe(this, "User", user);

                //build request
                let endpoint = installation.url + this.api_url + this.app_routes_url + 'ilias-app/desktop?';
                let params: URLSearchParams = new URLSearchParams();

                //fire request and resolve.
                return <Promise<Object[]>> this.http.get(endpoint, {headers: this.getAuthHeaders(user), search: params})
                    .timeout(timeout?timeout:this.defaultTimeout)
                    // .timeoutWith
                    .map((response) => response.json())
                    .toPromise()
                    .then(result =>  {
                        Log.describe(this, "res", result);
                        return Promise.resolve(result);
                    })
                    .catch(error => {
                        Log.error(this, error);
                        if (error.status && error.status == 401) {
                            this.logout();
                        }
                        return Promise.reject(new RESTAPIException(error));
                    });
                });
    }

    /**
     * FOR TESTING ONLY!
     * @param ms
     * @returns {Promise<T>}
     */
    protected delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    /**
     * Get ILIAS objects under the given parent ref-ID
     * @param parentRefId
     * @param user
     * @param recursive
     * @returns {Promise<Array<Object>>}
     */
    public getObjectData(parentRefId: number, user: User, recursive: boolean = false, timeout: number = null): Promise<Object[]> {

        let installation;

        return this.getInstallation(user)
            .then(insta => {
                installation = insta;
                return this.checkAndUpdateAccessToken(user, installation, timeout);
            }).then(() => {
                // do your work.
                let endpoint = installation.url + this.api_url + this.app_routes_url + 'ilias-app/objects/' + parentRefId;
                if (recursive) endpoint += '?recursive=1';

                return <Promise<Object[]>> this.http.get(endpoint, {headers: this.getAuthHeaders(user)})
                    .timeout(timeout?timeout:this.defaultTimeout)
                    .map((response) => response.json())
                    .toPromise()
                    .catch(error => {
                        if (error.status && error.status == 401) {
                            this.logout();
                        }
                        return Promise.reject(new RESTAPIException(error));
                    });
            });
    }


    /**
     * Get metadata of an ILIAS file object with the given refId
     * @param refId
     * @param user
     * @returns {Promise<Object>}
     */
    public getFileData(refId: number, user: User, timeout: number = null): Promise<Object> {
        let installation;

        return this.getInstallation(user)
            .then(insta => {
                installation = insta;
                return this.checkAndUpdateAccessToken(user, installation, timeout);
            }).then(() => {
                let endpoint = installation.url + this.api_url + this.app_routes_url + 'ilias-app/files/' + refId;
                return this.http.get(endpoint, {headers: this.getAuthHeaders(user)})
                    .timeout(timeout?timeout:this.defaultTimeout)
                    .map((response) => response.json())
                    .toPromise()
                    .catch(error => {
                        if (error.status && error.status == 401) {
                            this.logout();
                        }
                        return Promise.reject(new RESTAPIException(error));
                    });
            });
    }


    public downloadFile(refId: number, storageLocation: string, user: User, progressListener = null, timeout = null): Promise<any> {
        let installation: ILIASInstallation;
        return this.getInstallation(user)
            .then((install) => {
                installation = install;
                return this.checkAndUpdateAccessToken(user, installation, timeout);
            })
            .then(user => {

                let endpoint = encodeURI(installation.url + this.api_url + '/v1/files/' + refId);
                try {
                    let transfer = this.transfer.create();

                    if (progressListener) {
                        transfer.onProgress(progressListener);
                    }

                    Log.describe(this, "Downloading from: ", endpoint);
                    Log.describe(this, "Downloading to: ", storageLocation);

                    return transfer.download(endpoint, storageLocation, false, {headers: this.getAuthHeaders(user)});
                } catch (e) {
                    return Promise.reject(e);
                }
            }).catch(error => {
                //if we no longer have the permission to the ressource we want to logout.
                if (error.status && error.status == 401) {
                    this.logout();
                }
                return Promise.reject(new RESTAPIException(error));
            })
    }

    protected getInstallation(user: User): Promise<ILIASInstallation> {
        return this.configFactory.get()
            .then(config => {
                const installation = config.installations.filter((installation) => {
                    return installation.id == user.installationId;
                });
                if (installation.length) {
                    return Promise.resolve(installation[0]);
                }
                return Promise.reject("The user has no valid installation ID!");
            });
    }

    public checkAndUpdateAccessToken(user: User, installation: ILIASInstallation, timeout = null): Promise<User> {
        Log.describe(this, "install...", this.isStillValid(user.lastTokenUpdate, installation.accessTokenTTL));

        // If the token is fresh enough, we just resolve.
        if (this.isStillValid(user.lastTokenUpdate, installation.accessTokenTTL)) {
            Log.describe(this, "lastTokenUpdate", user.lastTokenUpdate);
            Log.describe(this, "accessTokenTTL", installation.accessTokenTTL);
            return Promise.resolve(user);
        }

        //Otherwise we update the token
        //generates post request that looks sth like: http://localhost/ilias_50/restplugin.php/v2/oauth2/token?api_key=ilias_app&api_secret=abb1.6b92-9c&grant_type=refresh_token&refresh_token=Nix0cnVuayxpbGlhc19hcHAscmVmcmVzaCwsLDIwMzk0NjY0OTUxLE5xaGcyUWl5TzE5VlVvOEQzMlZPQzR4elFOalIySSwzMzE0NzNlODNjNWYzOTJmMTMzZjc5ZWY2Yzc1MmFjNzE2NzIzYmQ5ZDAzMzNhNDVlNjE2Zjg3MTBiMDJmMzk4
        let endpoint = installation.url + this.api_url + '/v2/oauth2/token?api_key=' + installation.apiKey + '&api_secret=' + installation.apiSecret + '&grant_type=refresh_token&refresh_token=' + user.refreshToken;
        Log.describe(this, "Refreshing Token using: ", endpoint);

        return this.http.post(endpoint, null)
            .timeout(timeout?timeout:this.defaultTimeout)
            .toPromise()
            .then(response => {
                let data = response.json();
                user.accessToken = data.access_token;
                user.refreshToken = data.refresh_token;
                user.lastTokenUpdate = Date.now();
                return user.save() as Promise<User>;
            }).catch(error => {
                if (error.status && error.status == 401) {
                    this.logout();
                }
                return Promise.reject(new RESTAPIException(error));
            })
    }

    protected isStillValid(updatedAt: number, timeToLife: number): boolean {
        return Date.now() - updatedAt < timeToLife;
    }

    /**
     * Build authentication headers containing the users accessToken
     * @param user
     * @param withDebugHeaders
     * @returns Headers
     */
    protected getAuthHeaders(user: User, withDebugHeaders: boolean = false): Headers {
        let authHeaders = new Headers();
        authHeaders.append('Authorization', 'Bearer ' + user.accessToken);
        if (withDebugHeaders) {
            authHeaders.append('XDEBUG_SESSION', 'PHPSTORM');
        }
        return authHeaders;
    }

    protected logout() {
        this.event.publish("doLogout");
    }
}
