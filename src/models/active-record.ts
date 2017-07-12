import {DatabaseService, SQLiteDatabaseService} from "../services/database.service";
import {Log} from "../services/log.service";

export interface DatabaseConnector {
    /**
     * Table name
     */
    table:string;

    /**
     * Table fields
     */
    dbFields:Array<string>;

    /**
     * Execute a query
     * @param sql
     * @param params
     */
    query(sql:string, params?:Array<any>);

    /**
     * Read data from database with given ID and return fields and values
     * Returns a promise that resolves the data
     * @param id
     */
    read(id:number):Promise<Object>;

    /**
     * Persist data with given values in database. If id is zero, create entry otherwise update entry
     * Returns a promise that resolves the generated primary ID
     * @param id
     * @param values
     */
    save(id:number, values:Array<any>):Promise<number>;


    /**
     * Deletes the object with given primary ID from database
     * @param id
     */
    destroy(id:number):Promise<any>;

}

/**
 * Connects a model to the database by providing table name and fields
 */
export class SQLiteConnector implements DatabaseConnector {

    public table:string;
    public dbFields:Array<string>;
    protected database:DatabaseService;

    constructor(table:string, dbFields:Array<string>) {
        this.table = table;
        this.dbFields = dbFields;
    }

    query(sql:string, params = []) {
        return SQLiteDatabaseService.instance()
            .then(db => db.query(sql, params));
    }

    read(id:number):Promise<Object> {
        return this.query('SELECT * FROM ' + this.table + ' WHERE id = ?', [id]).then((response:any) => {
            if (response.rows.length == 0) {
                let error = new Error('ActiveRecord: Could not find database entry with primary key `' + id + '` in table ' + this.table);
                return Promise.reject(error);
            }
            return Promise.resolve(response.rows.item(0));
        });
    }

    save(id:number, values:Array<any>):Promise<number> {
        if (id > 0) {
            return this.update(values, id);
        } else {
            return this.create(values);
        }
    }

    /**
     * creates an array with length "n" where all values are "value"
     * @param n
     * @param value
     * @returns {string[]}
     */
    private nTimes(n, value) {
        let placeholders:string[] = [];
        for (let i = 0; i < n; i++) {
            i = i; // just to shut up the linter
            placeholders.push(value);
        }
        return placeholders;
    };

    /**
     * Crates an entry for the DB and returns the ID.
     * @param values
     * @returns {Promise<TResult>}
     */
    private create(values):Promise<number> {
        this.setArrayValueToNow('createdAt', values);
        return this.query('INSERT INTO ' + this.table + '(' + this.dbFields.join() + ') VALUES (' + this.nTimes(this.dbFields.length, '?').join() + ')', values)
            .then((response:any) => Promise.resolve(<number> response.insertId));
    };

    /**
     * updates the entry into the db an returns the ID
     * @param values
     * @param id
     * @returns {Promise<TResult>}
     */
    private update(values, id):Promise<number> {
        this.setArrayValueToNow('updatedAt', values);
        return this.query('UPDATE ' + this.table + ' SET ' + this.dbFields.join('=?,') + '=? WHERE id = ' + id, values).then( () => {
            return Promise.resolve(<number> id);
        });
    };

    /**
     *
     * @param values
     */
    private setArrayValueToNow(field, values) {
        let pos = this.dbFields.indexOf(field);
        if (pos > -1) {
            let date = new Date().toISOString();
            values[pos] = date;
        }
    };

    destroy(id:number):Promise<any> {
        Log.describe(this, "deleting item with table and id: ", {table: this.table, id: id});
        return this.query('DELETE FROM ' + this.table + ' WHERE id = ?', [id]);
    }
}

/**
 * Base class for models that need to persis data in the database
 */
export abstract class ActiveRecord {

    public _id:number = 0;
    protected connector:DatabaseConnector;

    constructor(id = 0, connector:DatabaseConnector) {
        this._id = id;
        this.connector = connector;
    }

    /**
     * Initialize object properties from connector
     */
    public read():Promise<ActiveRecord> {
            return this.connector.read(this._id).then((data) => {
                for (let key in data) {
                    if (this.connector.dbFields.indexOf(key) > -1) {
                        this[key] = data[key];
                    }
                }
                return Promise.resolve(this);
            });
    }

    /**
     * Build the ActiveRecord object from a given JS Object (handles primary key and all properties)
     * @param object
     */
    public readFromObject(object:Object) {
        for (let property in object) {
            if (property == 'id') {
                this._id = object[property];
            } else if (object.hasOwnProperty(property)) {
                this[property] = object[property];
            }
        }
    }


    /**
     * Returns the primary key
     * @returns {number}
     */
    public get id() {
        return this._id;
    }


    /**
     * Implement this method in derived objects to create instances of fully loaded ActiveRecords.
     * This method guarantees that the object's properties are available, in contrast to creating the object
     * via constructor due to asynchronous database fetching.
     *
     * Examples:
     *
     * User.find(12).then((user) => { console.log(user.iliasLogin); }); // Outputs the ILIAS login
     *
     * versus:
     *
     * let user = new User(12);
     * user.read();
     * console.log(user.iliasLogin); // Outputs undefined because reading from DB is async
     *
     * @param id
     */
    static find(id:number):Promise<ActiveRecord> {
        throw new Error("Must be implemented by subclass");
    }


    /**
     * Persist object in database, new objects are created while existing are updated
     * Returns a Promise resolving the saved object
     */
    public save():Promise<ActiveRecord> {
        return this.connector.save(this._id, this.getDbFieldValues()).then((newId) => {
            this._id = newId;
            return Promise.resolve(this);
        });
    }

    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    public destroy():Promise<any> {
        return this.connector.destroy(this._id);
    }


    /**
     * Return the current values of all dbFields
     * @returns {Array}
     */
    protected getDbFieldValues() {
        let values = [];
        for (let property of this.connector.dbFields) {
            // Convert undefined to null
            let value = (this[property] === undefined) ? null : this[property];
            // Automatic conversions
            if (typeof value === 'boolean') {
                value = (value) ? 1 : 0;
            } else if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }
            values.push(value);
        }
        return values;
    }

}