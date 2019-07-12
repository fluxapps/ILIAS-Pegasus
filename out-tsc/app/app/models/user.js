var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ActiveRecord, SQLiteConnector } from "./active-record";
import { SQLiteDatabaseService } from "../services/database.service";
import { Settings } from "./settings";
import { ILIASObject } from "./ilias-object";
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User(id) {
        if (id === void 0) { id = 0; }
        return _super.call(this, id, new SQLiteConnector("users", [
            "installationId",
            "iliasUserId",
            "iliasLogin",
            "accessToken",
            "refreshToken",
            "lastTokenUpdate",
            "lastVersionLogin"
        ])) || this;
    }
    Object.defineProperty(User.prototype, "settings", {
        /**
         * Get settings
         * @returns {Promise<Settings>}
         */
        get: function () {
            if (this._settings) {
                return Promise.resolve(this._settings);
            }
            return Settings.findByUserId(this.id);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Find user by primary ID, returns a Promise resolving the fully loaded user object
     * @param id
     * @returns {Promise<User>}
     */
    User.find = function (id) {
        var user = new User(id);
        return user.read()
            .then(function (activeRecord) { return activeRecord; });
    };
    /**
     * Find user by ILIAS userId and installationId. Returns either existing user or new instance!
     * @returns {Promise<User>}
     */
    User.findByILIASUserId = function (iliasUserId, installationId) {
        return new Promise(function (resolve, reject) {
            SQLiteDatabaseService.instance().then(function (db) {
                db.query("SELECT * FROM users WHERE iliasUserId = ? AND installationId = ?", [iliasUserId, installationId]).then(function (response) {
                    var user = new User();
                    if (response.rows.length == 0) {
                        user.iliasUserId = iliasUserId;
                        user.installationId = installationId;
                        resolve(user);
                    }
                    else {
                        user.readFromObject(response.rows.item(0));
                        resolve(user);
                    }
                }, function (error) {
                    reject(error);
                });
            });
        });
    };
    /**
     * Find the active user in the app (accessToken is present). Resolves the promise if found, rejects otherwise
     * @returns {Promise<User>}
     */
    User.findActiveUser = function () {
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query("SELECT * FROM users WHERE accessToken IS NOT NULL"); })
            .then(function (response) {
            if (response.rows.length == 0) {
                return Promise.reject("No active user found.");
            }
            else {
                var user = new User();
                user.readFromObject(response.rows.item(0));
                return Promise.resolve(user);
            }
        });
    };
    /**
     * Returns a promise resolving the current active user. If no active user is found (no user has an accessToken),
     * the promise is rejected.
     * @returns {User}
     */
    User.currentUser = function () {
        if (window["cordova"]) {
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
    };
    /**
     * Deletes the object from the database
     * Note: delete is a reserved word ;)
     * @returns {Promise<any>}
     */
    User.prototype.destroy = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var promises = [];
            ILIASObject.findByUserId(_this.id).then(function (objects) {
                objects.forEach(function (object) {
                    promises.push(object.destroy());
                });
            });
            promises.push(_super.prototype.destroy.call(_this));
            Promise.all(promises).then(function () {
                resolve();
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    /**
     * Find all users of this app
     */
    User.findAllUsers = function () {
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query("SELECT * FROM users"); })
            .then(function (response) {
            var users = [];
            for (var i = 0; i < response.rows.length; i++) {
                var user = new User();
                user.readFromObject(response.rows.item(i));
                users.push(user);
            }
            return Promise.resolve(users);
        });
    };
    return User;
}(ActiveRecord));
export { User };
//# sourceMappingURL=user.js.map