import {Inject, Injectable} from '@angular/core';
import {User} from "../models/user";
import {ILIASInstallation} from "../config/ilias-config";
import {SQLiteDatabaseService} from "./database.service";
import {DatabaseService} from "./database.service";
import {ILIAS_CONFIG_FACTORY, ILIASConfigFactory} from "./ilias-config-factory";

/**
 * Main service of the ILIAS app, used to access globals such as the current user, config etc.
 * An instance of this service is created when bootstrapping the app and is globally available across all components.
 */
@Injectable()
export class ConnectionService {

    constructor(
      @Inject(ILIAS_CONFIG_FACTORY)
      private readonly configFactory: ILIASConfigFactory
    ) {}

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
            this.configFactory.get().then((config) => {
                let installation = config.installations.filter((installation) => {
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
        	this.configFactory.get().then( (config) => {
                resolve(config.installations);
            })
        });
    }
}
