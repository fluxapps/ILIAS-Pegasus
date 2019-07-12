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
/** logging */
import { Log } from "../services/log.service";
/** misc */
import { ActiveRecord, SQLiteConnector } from "./active-record";
import { SQLiteDatabaseService } from "../services/database.service";
import { ILIASObject } from "./ilias-object";
var DesktopItem = /** @class */ (function (_super) {
    __extends(DesktopItem, _super);
    function DesktopItem(id) {
        if (id === void 0) { id = 0; }
        return _super.call(this, id, new SQLiteConnector("desktop", [
            "userId",
            "objId",
        ])) || this;
    }
    /**
     * Store all given ILIAS object as DesktopItem for the given user
     * @param userId
     * @param desktopItems
     */
    DesktopItem.storeDesktopItems = function (userId, desktopItems) {
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query("SELECT * FROM desktop WHERE userId = ?", [userId]); })
            .then(function (response) {
            var existingItems = [];
            var promises = [];
            for (var i = 0; i < response.rows.length; i++) {
                var desktopItem = new DesktopItem();
                desktopItem.readFromObject(response.rows.item(i));
                existingItems.push(desktopItem);
            }
            // Store new delivered desktopItems
            desktopItems.forEach(function (desktopItem) {
                var index = existingItems.findIndex(function (item) {
                    return (item.objId == desktopItem.objId);
                });
                if (index == -1) {
                    // Item does not yet exist, create
                    var newDesktopItem = new DesktopItem();
                    newDesktopItem.userId = userId;
                    newDesktopItem.objId = desktopItem.objId;
                    promises.push(newDesktopItem.save());
                }
            });
            // Delete items no longer delivered
            existingItems.forEach(function (existingItem) {
                var index = desktopItems.findIndex(function (item) {
                    return (item.objId == existingItem.objId);
                });
                if (index == -1) {
                    promises.push(existingItem.destroy());
                }
            });
            return Promise.all(promises);
        });
    };
    /**
     * The overriden method makes sure the save action is atomic. We don't want the same input item twice on the desktop.
     * @returns {Promise<DesktopItem>}
     */
    DesktopItem.prototype.save = function () {
        var _this = this;
        return this.connector.query("INSERT OR REPLACE INTO " + this.connector.table + "(userId, objId) VALUES (" + this.userId + ", " + this.objId + ")")
            .then(function (response) { return Promise.resolve(response.insertId); })
            .then(function (newId) {
            _this._id = newId;
            return Promise.resolve(_this);
        });
    };
    /**
     * Get ILIAS objects on desktop from a given user
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    DesktopItem.findByUserId = function (userId) {
        var _this = this;
        return SQLiteDatabaseService.instance()
            .then(function (db) {
            var sql = "SELECT objects.* FROM desktop " +
                "INNER JOIN objects ON (objects.objId = desktop.objId AND objects.userId = desktop.userId) " +
                "WHERE desktop.userId = ?";
            return db.query(sql, [userId]);
        }).then(function (response) {
            var iliasObjectPromises = [];
            for (var i = 0; i < response.rows.length; i++) {
                iliasObjectPromises.push(ILIASObject.find(response.rows.item(i).id));
                Log.describe(_this, "Desktop item row: ", response.rows.item(i));
            }
            return Promise.all(iliasObjectPromises)
                .then(function (desktopItems) { return desktopItems.sort(ILIASObject.compare); });
        });
    };
    return DesktopItem;
}(ActiveRecord));
export { DesktopItem };
//# sourceMappingURL=desktop-item.js.map