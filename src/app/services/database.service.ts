import { type } from "os";
import { Connection, EntityManager } from "typeorm/browser";
import { Logger } from "./logging/logging.api";
import { Logging } from "./logging/logging.service";

export interface DatabaseService {
    query(sql: string, params?: Array<object>): Promise<object>;
}

class LegacySQLQueryResultCollection {

    [Symbol.iterator]: Generator = function*(): Iterator<unknown> {
        for (const item of this.items) {
            yield item;
        }
    }.bind(this);

    get length(): number {
        return this.items.length;
    }

    constructor(
        private readonly items: ReadonlyArray<unknown>
    ) {
    }

    item(index: number): unknown {
        return this.items[index];
    }
}

/**
 * Abstracts access to database (SQLite)
 */
export class SQLiteDatabaseService implements DatabaseService {

    private static singleton: SQLiteDatabaseService;
    static connection: Connection;

    private readonly log: Logger = Logging.getLogger("SQLiteDatabaseService");

    private constructor() {
    }

    /**
     * Return singleton instance of DatabaseService
     *
     * @returns {DatabaseService}
     * @deprecated Since version 1.1.0. Will be deleted in version 2.0.0. Use angular injection instead.
     */
    static async instance(): Promise<SQLiteDatabaseService> {
        if (SQLiteDatabaseService.singleton != undefined) {
            return SQLiteDatabaseService.singleton;
        }

        SQLiteDatabaseService.singleton = new SQLiteDatabaseService();
        return SQLiteDatabaseService.singleton;
    }

    /**
     * Execute SQL statement
     * @param sql SQL statement as string, values can be escaped with "?"
     * @param params Array holding the values escaped in the SQL string, in the same order
     * @returns {Promise<any>}
     */
    async query(sql: string, params: Array<unknown> = []): Promise<any> {
        const result: Array<unknown> = await SQLiteDatabaseService.connection.query(sql, params);
        this.log.debug(() => `Query result: ${JSON.stringify(result)}`);
        return {
            rows: new LegacySQLQueryResultCollection(result),
            rowsAffected: 0,
            insertId: 0
        };
        // return this.database.executeSql(sql, params);
    }

    async transaction<T>(project: (entityManager: EntityManager) => Promise<T>): Promise<T> {
        return SQLiteDatabaseService.connection.transaction(project);
    }
}
