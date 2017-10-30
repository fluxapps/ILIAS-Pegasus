import {SQLite, SQLiteDatabaseConfig, SQLiteObject} from '@ionic-native/sqlite';
import {Log} from "./log.service";

export interface DatabaseService {
    query(sql:string, params?:Array<any>):Promise<any>;
}

/**
 * Abstracts access to database (SQLite)
 */
export class SQLiteDatabaseService implements DatabaseService {

    public static _instance:SQLiteDatabaseService;
    static  SQLITE: SQLite;

    public DB_NAME = 'ilias_app';
    private database: SQLiteObject;

  private constructor() {}

  /**
     * Return singleton instance of DatabaseService
     *
     * @returns {DatabaseService}
     * @deprecated Since version 1.1.0. Will be deleted in version 2.0.0. Use angular injection instead.
     */
    static instance():Promise<SQLiteDatabaseService> {
        if (SQLiteDatabaseService._instance != null) {
            return Promise.resolve(SQLiteDatabaseService._instance);
        }

        SQLiteDatabaseService._instance = new SQLiteDatabaseService();
        return SQLiteDatabaseService._instance.initDatabase().then(
            () => Promise.resolve(SQLiteDatabaseService._instance));
    }

    private openDatabase():Promise<SQLiteObject> {
        return new Promise((resolve, reject) => {

            if ((<any> window).cordova) {
                Log.write(this, "using database cordova plugin.");
                Log.write(this, "opening DB.");

                let config: SQLiteDatabaseConfig = {
                  name: this.DB_NAME,
                  location: "default"
                };

                SQLiteDatabaseService.SQLITE.create(config)
                  .then( (db) => {
                    Log.write(this, "database opened");
                   resolve(db);
                  }).catch((err) => {
                    console.error('Unable to open database: ', err);
                    reject(err);
                  });
            } else {
                let database = (<any> window).openDatabase(this.DB_NAME, '1.0', this.DB_NAME, 1024 * 1024 * 100); // browser
                if(database) {
                    resolve(database);
                } else {
                    Log.error(this, "Unable to open database");
                    reject("Unable to open database");
                }
            }
        });
    }

    private initDatabase():Promise<any> {
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
          return this.database.executeSql(sql, params);
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
