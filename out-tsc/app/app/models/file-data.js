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
/**
 * Holds additional meta data for ILIAS file objects
 */
var FileData = /** @class */ (function (_super) {
    __extends(FileData, _super);
    function FileData(id) {
        if (id === void 0) { id = 0; }
        return _super.call(this, id, new SQLiteConnector("files", [
            "iliasObjectId",
            "fileName",
            "fileSize",
            "fileType",
            "fileExtension",
            "fileVersionDate",
            "fileVersionDateLocal",
        ])) || this;
    }
    FileData.prototype.needsDownload = function () {
        if (!this.hasOwnProperty("fileVersionDateLocal")) {
            return true;
        }
        if (!this.fileVersionDateLocal) {
            return true;
        }
        return (Date.parse(this.fileVersionDate) > Date.parse(this.fileVersionDateLocal));
    };
    /**
     * Get FileData object by corresponding internal ID of an ILIASObject
     * @param iliasObjectId
     * @returns {Promise<FileData>}
     */
    FileData.find = function (iliasObjectId) {
        return SQLiteDatabaseService.instance()
            .then(function (db) {
            return db.query("SELECT * FROM files WHERE iliasObjectId = ?", [iliasObjectId]);
        })
            .then(function (response) {
            var fileData = new FileData();
            if (response.rows.length == 0) {
                fileData.iliasObjectId = iliasObjectId;
            }
            else {
                fileData.readFromObject(response.rows.item(0));
            }
            return Promise.resolve(fileData);
        });
    };
    /**
     * Calculate the used disk space of the given user
     * @param user
     * @returns {Promise<number>}
     */
    FileData.getTotalDiskSpaceForUser = function (user) {
        return SQLiteDatabaseService.instance()
            .then(function (db) {
            return db.query("SELECT SUM(files.fileSize) AS diskSpace FROM users " +
                "INNER JOIN objects ON objects.userId = users.id " +
                "INNER JOIN files ON files.iliasObjectId = objects.id " +
                "WHERE users.id = ? AND objects.isOfflineAvailable = 1 GROUP BY users.id", [user.id]);
        })
            .then(function (response) {
            var diskSpace = 0;
            if (response.rows.length) {
                diskSpace = response.rows.item(0).diskSpace;
            }
            return Promise.resolve(diskSpace);
        });
    };
    /**
     * Returns the total disk space used by files on this device over all users and installations
     * @returns {Promise<number>}
     */
    FileData.getTotalDiskSpace = function () {
        return SQLiteDatabaseService.instance()
            .then(function (db) {
            return db.query("SELECT * FROM files WHERE fileVersionDateLocal is NOT NULL");
        })
            .then(function (response) {
            var usedDiskSpace = 0;
            for (var i = 0; i < response.rows.length; i++) {
                usedDiskSpace += response.rows.item(i).fileSize;
            }
            return Promise.resolve(usedDiskSpace);
        });
    };
    /**
     * Returns true if there is a local file version but it is no longer up to date
     * @returns {boolean}
     */
    FileData.prototype.isUpdated = function () {
        return this.hasOwnProperty("fileVersionDateLocal") && this.fileVersionDateLocal && this.needsDownload();
    };
    return FileData;
}(ActiveRecord));
export { FileData };
//# sourceMappingURL=file-data.js.map