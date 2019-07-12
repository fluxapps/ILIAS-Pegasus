import { Log } from "./log.service";
/**
 * Abstracts access to database (SQLite)
 */
var SQLiteDatabaseService = /** @class */ (function () {
    function SQLiteDatabaseService() {
        this.DB_NAME = "ilias_app";
    }
    /**
     * Return singleton instance of DatabaseService
     *
     * @returns {DatabaseService}
     * @deprecated Since version 1.1.0. Will be deleted in version 2.0.0. Use angular injection instead.
     */
    SQLiteDatabaseService.instance = function () {
        if (SQLiteDatabaseService._instance != undefined) {
            return Promise.resolve(SQLiteDatabaseService._instance);
        }
        SQLiteDatabaseService._instance = new SQLiteDatabaseService();
        return SQLiteDatabaseService._instance.initDatabase().then(function () { return Promise.resolve(SQLiteDatabaseService._instance); });
    };
    SQLiteDatabaseService.prototype.openDatabase = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Log.write(_this, "using database cordova plugin.");
            Log.write(_this, "opening DB.");
            var config = {
                name: _this.DB_NAME,
                location: "default"
            };
            SQLiteDatabaseService.SQLITE.create(config)
                .then(function (db) {
                Log.write(_this, "database opened");
                resolve(db);
            }).catch(function (err) {
                console.error("Unable to open database: ", err);
                reject(err);
            });
        });
    };
    SQLiteDatabaseService.prototype.initDatabase = function () {
        var _this = this;
        Log.write(this, "Initializing database.");
        return new Promise(function (resolve, reject) {
            _this.openDatabase().then(function (db) {
                Log.describe(_this, "database inited with: ", db);
                _this.database = db;
                resolve(db);
            }).catch(function (err) {
                Log.error(_this, err);
                reject(err);
            });
        });
    };
    /**
     * Execute SQL statement
     * @param sql SQL statement as string, values can be escaped with "?"
     * @param params Array holding the values escaped in the SQL string, in the same order
     * @returns {Promise<any>}
     */
    SQLiteDatabaseService.prototype.query = function (sql, params) {
        if (params === void 0) { params = []; }
        return this.database.executeSql(sql, params);
    };
    return SQLiteDatabaseService;
}());
export { SQLiteDatabaseService };
//# sourceMappingURL=database.service.js.map