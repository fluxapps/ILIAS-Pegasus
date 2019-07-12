/** logging */
import { Log } from "../services/log.service";
/** misc */
import { SQLiteDatabaseService } from "../services/database.service";
/**
 * Connects a model to the database by providing table name and fields
 */
var SQLiteConnector = /** @class */ (function () {
    function SQLiteConnector(table, dbFields) {
        this.table = table;
        this.dbFields = dbFields;
    }
    SQLiteConnector.prototype.query = function (sql, params) {
        if (params === void 0) { params = []; }
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query(sql, params); });
    };
    SQLiteConnector.prototype.read = function (id) {
        var _this = this;
        return this.query("SELECT * FROM " + this.table + " WHERE id = ?", [id]).then(function (response) {
            if (response.rows.length == 0) {
                var error = new Error("ActiveRecord: Could not find database entry with primary key `" + id + "` in table " + _this.table);
                return Promise.reject(error);
            }
            return Promise.resolve(response.rows.item(0));
        });
    };
    SQLiteConnector.prototype.save = function (id, values) {
        if (id > 0) {
            return this.update(values, id);
        }
        else {
            return this.create(values);
        }
    };
    /**
     * creates an array with length "n" where all values are "value"
     * @param n
     * @param value
     * @returns {string[]}
     */
    SQLiteConnector.prototype.nTimes = function (n, value) {
        var placeholders = [];
        for (var i = 0; i < n; i++) {
            i = i; // just to shut up the linter
            placeholders.push(value);
        }
        return placeholders;
    };
    ;
    /**
     * Crates an entry for the DB and returns the ID.
     * @param values
     * @returns {Promise<TResult>}
     */
    SQLiteConnector.prototype.create = function (values) {
        this.setArrayValueToNow("createdAt", values);
        return this.query("INSERT INTO " + this.table + "(" + this.dbFields.join() + ") VALUES (" + this.nTimes(this.dbFields.length, "?").join() + ")", values)
            .then(function (response) { return Promise.resolve(response.insertId); });
    };
    ;
    /**
     * updates the entry into the db an returns the ID
     * @param values
     * @param id
     * @returns {Promise<TResult>}
     */
    SQLiteConnector.prototype.update = function (values, id) {
        this.setArrayValueToNow("updatedAt", values);
        return this.query("UPDATE " + this.table + " SET " + this.dbFields.join("=?,") + "=? WHERE id = " + id, values).then(function () {
            return Promise.resolve(id);
        });
    };
    ;
    /**
     *
     * @param values
     */
    SQLiteConnector.prototype.setArrayValueToNow = function (field, values) {
        var pos = this.dbFields.indexOf(field);
        if (pos > -1) {
            var date = new Date().toISOString();
            values[pos] = date;
        }
    };
    ;
    SQLiteConnector.prototype.destroy = function (id) {
        Log.describe(this, "deleting item with table and id: ", { table: this.table, id: id });
        return this.query("DELETE FROM " + this.table + " WHERE id = ?", [id]);
    };
    return SQLiteConnector;
}());
export { SQLiteConnector };
/**
 * Base class for models that need to persis data in the database
 */
var ActiveRecord = /** @class */ (function () {
    function ActiveRecord(id, connector) {
        if (id === void 0) { id = 0; }
        this._id = 0;
        this._id = id;
        this.connector = connector;
    }
    /**
     * Initialize object properties from connector
     */
    ActiveRecord.prototype.read = function () {
        var _this = this;
        return this.connector.read(this._id).then(function (data) {
            for (var key in data) {
                if (_this.connector.dbFields.indexOf(key) > -1) {
                    _this[key] = data[key];
                }
            }
            return Promise.resolve(_this);
        });
    };
    /**
     * Build the ActiveRecord object from a given JS Object (handles primary key and all properties)
     * @param object
     */
    ActiveRecord.prototype.readFromObject = function (object) {
        for (var property in object) {
            if (property == "id") {
                this._id = object[property];
            }
            else if (object.hasOwnProperty(property)) {
                this[property] = object[property];
            }
        }
    };
    Object.defineProperty(ActiveRecord.prototype, "id", {
        /**
         * Returns the primary key
         * @returns {number}
         */
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Persist object in database, new objects are created while existing are updated
     * Returns a Promise resolving the saved object
     */
    ActiveRecord.prototype.save = function () {
        var _this = this;
        return this.connector.save(this._id, this.getDbFieldValues()).then(function (newId) {
            _this._id = newId;
            return Promise.resolve(_this);
        });
    };
    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    ActiveRecord.prototype.destroy = function () {
        return this.connector.destroy(this._id);
    };
    /**
     * Return the current values of all dbFields
     * @returns {Array}
     */
    ActiveRecord.prototype.getDbFieldValues = function () {
        var values = [];
        for (var _i = 0, _a = this.connector.dbFields; _i < _a.length; _i++) {
            var property = _a[_i];
            // Convert undefined to null
            var value = (this[property] === undefined) ? null : this[property];
            // Automatic conversions
            if (typeof value === "boolean") {
                value = (value) ? 1 : 0;
            }
            else if (typeof value === "object" && value !== null) {
                value = JSON.stringify(value);
            }
            values.push(value);
        }
        return values;
    };
    return ActiveRecord;
}());
export { ActiveRecord };
//# sourceMappingURL=active-record.js.map