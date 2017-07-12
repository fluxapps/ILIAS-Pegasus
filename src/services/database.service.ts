import {SQLite} from 'ionic-native';
import {Log} from "./log.service";

export interface DatabaseService {
    query(sql:string, params?:Array<any>):Promise<any>;
}

/**
 * Abstracts access to database (SQLite)
 */
export class SQLiteDatabaseService implements DatabaseService {

    public static _instance:SQLiteDatabaseService;
    public DB_NAME = 'ilias_app';
    protected database:SQLite;

    public constructor() {
        if (SQLiteDatabaseService._instance) {
            throw new Error("SQLiteDatabaseService must be accessed via singleton: SQLiteDatabaseService.instance()")
        }

    }

    /**
     * Return singleton instance of DatabaseService
     * @returns {DatabaseService}
     */
    static instance():Promise<SQLiteDatabaseService> {
        if (SQLiteDatabaseService._instance) {
            return Promise.resolve(SQLiteDatabaseService._instance);
        }

        SQLiteDatabaseService._instance = new SQLiteDatabaseService();
        return SQLiteDatabaseService._instance.initDatabase().then(
            () => Promise.resolve(SQLiteDatabaseService._instance));
    }

    public openDatabase():Promise<SQLite> {
        return new Promise((resolve, reject) => {

            if ((<any> window).cordova) {
                Log.write(this, "using database cordova plugin.");
                let database = new SQLite();
                Log.write(this, "opening DB.");

                database.openDatabase({
                    name: 'ilias_app',
                    location: 'default' // the location field is required
                }).then( () => {
                    Log.write(this, "database opened");
                   resolve(database);
                }).catch((err) => {
                    console.error('Unable to open database: ', err);
                    reject(err);
                });
            } else {
                let database = (<any> window).openDatabase("ilias_app", '1.0', 'ilias_app', 1024 * 1024 * 100); // browser
                if(database) {
                    resolve(database);
                } else {
                    Log.error(this, "Unable to open database");
                    reject("Unable to open database");
                }
            }
        });
    }

    public initDatabase():Promise<any> {
        Log.write(this, "Initializing database.");
        return new Promise((resolve, reject) => {
        	this.openDatabase().then(db => {
                Log.describe(this, "database inited with: ", db);
                this.database = db;
                resolve(db);
            }).catch( err => {
                Log.error(this, err);
                reject(err);
            })
        });
    }

    /**
     * Execute SQL statement
     * @param sql SQL statement as string, values can be escaped with "?"
     * @param params Array holding the values escaped in the SQL string, in the same order
     * @returns {Promise<any>}
     */
    query(sql:string, params = []):Promise<any> {
        if ((<any> window).cordova) {
            let promise = this.database.executeSql(sql, params);
            return promise;
        } else {
            return new Promise((resolve, reject) => {
                this.database.transaction((tx) => {
                    tx.executeSql(sql, params, (tx, res) =>{
                        resolve(res);
                    });
                });
            });
        }
    }
}