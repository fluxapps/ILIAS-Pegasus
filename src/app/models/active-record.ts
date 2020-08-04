/** logging */
import { EntityManager } from "typeorm/browser";
/** misc */
import { DatabaseService, SQLiteDatabaseService } from "../services/database.service";
import { Log } from "../services/log.service";

export interface DatabaseConnector {
    /**
     * Table name
     */
    table: string;

    /**
     * Table fields
     */
    dbFields: Array<string>;

    /**
     * Execute a query
     * @param sql
     * @param params
     */
    query(sql: string, params?: Array<string | number>): Promise<object>;

    /**
     * Executes queries in a transaction.
     * In order to execute queries the supplied entity manager MUST be used!
     *
     * @param project
     */
    transaction<T>(project: (entityManager: EntityManager) => Promise<T>): Promise<T>;

    /**
     * Read data from database with given ID and return fields and values
     * Returns a promise that resolves the data
     * @param id
     */
    read(id: number): Promise<object>;

    /**
     * Persist data with given values in database. If id is zero, create entry otherwise update entry
     * Returns a promise that resolves the generated primary ID
     * @param id
     * @param values
     */
    save(id: number, values: Array<string | number>): Promise<number>;


    /**
     * Deletes the object with given primary ID from database
     * @param id
     */
    destroy(id: number): Promise<void>;

}

/**
 * Connects a model to the database by providing table name and fields
 */
export class SQLiteConnector implements DatabaseConnector {

    table: string;
    dbFields: Array<string>;
    protected database: DatabaseService;

    constructor(table: string, dbFields: Array<string>) {
        this.table = table;
        this.dbFields = dbFields;
    }

    async query(sql: string, params: Array<string | number> = []): Promise<object> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        return db.query(sql, params);
    }

    async transaction<T>(project: (entityManager: EntityManager) => Promise<T>): Promise<T> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        return db.transaction(project);
    }

    async read(id: number): Promise<object> {
        return this.query(`SELECT * FROM ${this.table} WHERE id = ?`, [id]).then((response: any) => {
            if (response.rows.length == 0) {
                const error: Error = new Error(`ActiveRecord: Could not find database entry with primary key ${id} in table ${this.table}`);
                return Promise.reject(error);
            }
            return Promise.resolve(response.rows.item(0));
        });
    }

    async save(id: number, values: Array<string | number>): Promise<number> {
        return  id > 0 ? this.update(values, id) : this.create(values);
    }

    /**
     * creates an array with length "n" where all values are "value"
     * @param n
     * @param value
     * @returns {string[]}
     */
    private nTimes(n: number, value: string): Array<string> {
        const placeholders: Array<string> = [];
        for (let i: number = 0; i < n; i++) {
            placeholders.push(value);
        }
        return placeholders;
    };

    /**
     * Crates an entry for the DB and returns the ID.
     * @param values
     * @returns {Promise<number>}
     */
    private async create(values: Array<string | number>): Promise<number> {
        return this.transaction(async(em: EntityManager) => {
            this.setArrayValueToNow("createdAt", values);
            await em.query(`INSERT INTO ${this.table}(${this.dbFields.join()}) VALUES (${this.nTimes(this.dbFields.length, "?").join()})`, values);
            const latestDataEntry: Array<{ id: number }> = await em.query(`SELECT id FROM ${this.table} ORDER BY id DESC`);
            return latestDataEntry[0].id;
        });

        // const result: any = await this.query(`INSERT INTO ${this.table}(${this.dbFields.join()}) VALUES (${this.nTimes(this.dbFields.length, "?").join()})`, values)
        // return result.insertId;
    };

    /**
     * updates the entry into the db an returns the ID
     * @param values
     * @param id
     * @returns {Promise<number>}
     */
    private async update(values: Array<number | string>, id: number): Promise<number> {
        this.setArrayValueToNow("updatedAt", values);
        await this.transaction((em: EntityManager) => em.query(`UPDATE ${this.table} SET ${this.dbFields.join("=?,")}=? WHERE id = ${id}`, values));
        return id;
    };

    /**
     *
     * @param field
     * @param values
     */
    private setArrayValueToNow(field: string, values: Array<string | number>): void {
        const pos: number = this.dbFields.indexOf(field);
        if (pos > -1) {
            const date: string = new Date().toISOString();
            values[pos] = date;
        }
    };

    async destroy(id: number): Promise<void> {
        Log.describe(this, "deleting item with table and id: ", {table: this.table, id: id});
        await this.query(`DELETE FROM ${this.table} WHERE id = ?`, [id]);
    }
}

/**
 * Base class for models that need to persis data in the database
 */
export abstract class ActiveRecord<T> {

    _id: number = 0;
    protected connector: DatabaseConnector;

    protected constructor(id: number = 0, connector: DatabaseConnector) {
        this._id = id;
        this.connector = connector;
    }

    /**
     * Initialize object properties from connector
     */
    async read(): Promise<T> {
        const data: object = await this.connector.read(this._id);
        for (const key in data) {
            if (this.connector.dbFields.indexOf(key) > -1) {
                this[key] = data[key];
            }
        }

        return (this as unknown) as T;
    }

    /**
     * Build the ActiveRecord object from a given JS Object (handles primary key and all properties)
     * @param object
     */
    readFromObject(object: object): void {
        for (const property in object) {
            if (property === "id") {
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
    get id(): number {
        return this._id;
    }


    /**
     * Persist object in database, new objects are created while existing are updated
     * Returns a Promise resolving the saved object
     */
    async save(): Promise<T> {
        this._id = await this.connector.save(this._id, this.getDbFieldValues());
        return (this as unknown) as T;
    }

    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    destroy(): Promise<void> {
        return this.connector.destroy(this._id);
    }


    /**
     * Return the current values of all dbFields
     * @returns {Array}
     */
    protected getDbFieldValues() {
        const values = [];
        for (const property of this.connector.dbFields) {
            // Convert undefined to null
            let value = (this[property] === undefined) ? null : this[property];
            // Automatic conversions
            if (typeof value === "boolean") {
                value = (value) ? 1 : 0;
            } else if (typeof value === "object" && value !== null) {
                value = JSON.stringify(value);
            }
            values.push(value);
        }
        return values;
    }

}
