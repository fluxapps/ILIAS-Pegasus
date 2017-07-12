import {Injectable} from '@angular/core';
import {User} from "../models/user";
import {ILIASConfig} from "../config/ilias-config";
import {ILIASInstallation} from "../models/ilias-installation";
import {Log} from "./log.service";
import {SQLiteDatabaseService} from "./database.service";
import {DatabaseService} from "./database.service";

/**
 * Main service of the ILIAS app, used to access globals such as the current user, config etc.
 * An instance of this service is created when bootstrapping the app and is globally available across all components.
 */
@Injectable()
export class ConnectionService {

    constructor(public _config:ILIASConfig) {
    }

    /**
     * Access to singleton instance of DatabaseService
     * @returns {DatabaseService}
     */
    get db():Promise<DatabaseService>{
        return SQLiteDatabaseService.instance();
    }

    /**
     * Get the ILIAS installation from the given user, see www/app-config.json
     * @param user
     * @returns {Promise<Object>}
     */
    installation(user:User):Promise<ILIASInstallation> {
        return new Promise((resolve, reject) => {
            let installationId = user.installationId;
            this.config('installations').then((installations:ILIASInstallation[]) => {
                let installation = installations.filter((installation) => {
                    return installation.id == installationId;
                });
                if (installation.length) {
                    resolve(installation[0]);
                }
            });
        });
    }

    installations():Promise<ILIASInstallation[]> {
        return new Promise((resolve, reject) => {
        	this.config('installations').then( (installations:ILIASInstallation[]) => {
                resolve(installations);
            })
        });
    }

    /**
     * Get a config value by key. Returns null if key does not exist
     * @param key
     * @returns {string|null}
     */
    config(key:string):Promise<any> {
        Log.write(this, "Getting Config: ", key);
        return this._config.get(key);
    }
}