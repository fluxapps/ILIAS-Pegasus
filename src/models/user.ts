import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {Settings} from "./settings";
import {ILIASObject} from "./ilias-object";

export class User extends ActiveRecord {

    /**
     * The internal user-ID in ILIAS corresponding to the installation given by installationID
     */
    public iliasUserId:number;

    /**
     * The ILIAS username corresponding to the installation given by installationID
     */
    public iliasLogin:string;

    /**
     * The ID of the ILIAS installation
     */
    public installationId:number;

    /**
     * OAuth2 Access-Token to query the ILIAS REST-interface
     */
    public accessToken:string;

    /**
     * OAuth2 Refresh-Token needed in exchange for a new access-token
     */
    public refreshToken:string;

    /**
     * When was the last time we refreshed the access token?
     */
    public lastTokenUpdate:number;

    /**
     * Holds the app settings
     */
    protected _settings:Settings;

    constructor(id = 0) {
        super(id, new SQLiteConnector('users', [
            'installationId',
            'iliasUserId',
            'iliasLogin',
            'accessToken',
            'refreshToken',
            'lastTokenUpdate'
        ]));
    }

    /**
     * Get settings
     * @returns {Promise<Settings>}
     */
    public get settings():Promise<Settings> {
        if (this._settings) {
            return Promise.resolve(this._settings);
        }

        return Settings.findByUserId(this.id);
    }


    /**
     * Find user by primary ID, returns a Promise resolving the fully loaded user object
     * @param id
     * @returns {Promise<User>}
     */
    static find(id:number):Promise<User> {
        let user = new User(id);
        return user.read()
          .then(activeRecord => { return activeRecord as User })
    }


    /**
     * Find user by ILIAS userId and installationId. Returns either existing user or new instance!
     * @returns {Promise<User>}
     */
    static findByILIASUserId(iliasUserId:number, installationId:number):Promise<User> {
        return new Promise((resolve, reject) => {
            SQLiteDatabaseService.instance().then(db => {
                db.query('SELECT * FROM users WHERE iliasUserId = ? AND installationId = ?', [iliasUserId, installationId]).then((response:any) => {
                    let user = new User();
                    if (response.rows.length == 0) {
                        user.iliasUserId = iliasUserId;
                        user.installationId = installationId;
                        resolve(user);
                    } else {
                        user.readFromObject(response.rows.item(0));
                        resolve(user);
                    }
                }, (error) => {
                    reject(error);
                });
            });
        });
    }


    /**
     * Find the active user in the app (accessToken is present). Resolves the promise if found, rejects otherwise
     * @returns {Promise<User>}
     */
    static findActiveUser():Promise<User> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query('SELECT * FROM users WHERE accessToken IS NOT NULL'))
            .then((response:any) => {
                if (response.rows.length == 0) {
                    return <Promise<User>> Promise.reject("No active user found.");
                } else {
                    let user = new User();
                    user.readFromObject(response.rows.item(0));
                    return Promise.resolve(<User> user);
                }
            });
    }

    /**
     * Returns a promise resolving the current active user. If no active user is found (no user has an accessToken),
     * the promise is rejected.
     * @returns {User}
     */
    public static currentUser():Promise<User> {
        if (window['cordova']) {
            return User.findActiveUser();
        }

        throw new Error("User can not be loaded in browser. This is not possible due the current state of the app.");

        // Return a fake user when developing in browser
        // return new Promise((resolve, reject) => {
        //     User.findActiveUser().then((user) => {
        //         resolve(user);
        //     }, () => {
        //         let user = new User();
        //         user.iliasLogin = 'root';
        //         user.accessToken = 'NixkZWZhdWx0LGlsaWFzX3BlZ2FzdXMsYWNjZXNzLCwsMTcxOTM4NTU3NCxsdktPRHBKWXlBSjFueW9CY2dmbzhFS0l1LGE3ZWFlNTVhZDcyOTc1NGNlN2Y5ZDhmODYwNGE2ODU0NGNmYWM1NWNhNWQ2M2Y5N2RlOGI2MGRiYjNmNjFmYWE';
        //         user.installationId = 5;
        //         user.iliasUserId = 6;
        //         user.refreshToken = '';
        //         user.lastTokenUpdate = Date.now();
        //         user.save().then((u) => {
        //             Log.describe(this, "user saved", u);
        //             resolve(u);
        //         }).catch(err => {
        //             Log.error(this, err);
        //             reject(err);
        //         });
        //     });
        // });
    }

    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    public destroy():Promise<any> {
        return new Promise((resolve, reject) => {
            let promises = [];
            ILIASObject.findByUserId(this.id).then(objects => {
                objects.forEach(object => {
                    promises.push(object.destroy());
                });
            });

            promises.push(super.destroy());

            Promise.all(promises).then(() => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    }

    /**
     * Find all users of this app
     */
    public static findAllUsers():Promise<User[]> {
       return SQLiteDatabaseService.instance()
           .then(db => db.query("SELECT * FROM users"))
           .then((response:any) => {
               let users = [];
               for (let i = 0; i < response.rows.length; i++) {
                   let user = new User();
                   user.readFromObject(response.rows.item(i));
                   users.push(user);
               }

               return Promise.resolve(users);
           });
    }
}
