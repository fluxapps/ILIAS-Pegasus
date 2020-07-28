import { SQLite, SQLiteDatabaseConfig, SQLiteObject } from "@ionic-native/sqlite/ngx";
import { Logger } from "./logging/logging.api";
import { Logging } from "./logging/logging.service";

export interface DatabaseService {
    query(sql: string, params?: Array<object>): Promise<object>;
}

/**
 * Abstracts access to database (SQLite)
 */
export class SQLiteDatabaseService implements DatabaseService {

    static _instance: SQLiteDatabaseService;
    static SQLITE: SQLite;

    readonly DB_NAME = "ilias_app";

    private readonly log: Logger = Logging.getLogger("SQLiteDatabaseService");

    private database: SQLiteObject;

    private constructor() {
    }

    /**
     * Return singleton instance of DatabaseService
     *
     * @returns {DatabaseService}
     * @deprecated Since version 1.1.0. Will be deleted in version 2.0.0. Use angular injection instead.
     */
    static async instance(): Promise<SQLiteDatabaseService> {
        if (SQLiteDatabaseService._instance != undefined) {
            return SQLiteDatabaseService._instance;
        }

        SQLiteDatabaseService._instance = new SQLiteDatabaseService();
        await SQLiteDatabaseService._instance.initDatabase();
        return SQLiteDatabaseService._instance;
    }

    private async initDatabase(): Promise<void> {
        try {
            this.log.debug(() => "Start database initialisation");

            const config: SQLiteDatabaseConfig = {
                name: this.DB_NAME,
                location: "default"
            };

            const sqLite: SQLiteObject = await SQLiteDatabaseService.SQLITE.create(config)
            this.log.info(() => `Database initialised`);

            this.database = sqLite;
        } catch (error) {
            this.log.fatal(() => `Database initialisation failed, reason: ${error.message}`);
        }
    }

    /**
     * Execute SQL statement
     * @param sql SQL statement as string, values can be escaped with "?"
     * @param params Array holding the values escaped in the SQL string, in the same order
     * @returns {Promise<any>}
     */
    async query(sql: string, params = []): Promise<any> {
        return this.database.executeSql(sql, params);
    }
}
