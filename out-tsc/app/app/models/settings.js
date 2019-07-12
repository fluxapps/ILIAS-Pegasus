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
/** misc */
import { ActiveRecord, SQLiteConnector } from "./active-record";
import { SQLiteDatabaseService } from "../services/database.service";
import { FileData } from "./file-data";
var Settings = /** @class */ (function (_super) {
    __extends(Settings, _super);
    function Settings(id) {
        if (id === void 0) { id = 0; }
        var _this = _super.call(this, id, new SQLiteConnector("settings", [
            "userId",
            "language",
            "downloadSize",
            "quotaSize",
            "downloadOnStart",
            "downloadWlan"
        ])) || this;
        /**
         * Language for app
         */
        _this.language = "de";
        /**
         * Max. allowed size for automatic downloads (mega bytes)
         */
        _this.downloadSize = 10;
        /**
         * Max. allowed quota for all files the app is storing (mega bytes)
         */
        _this.quotaSize = 300;
        /**
         * If true, execute offline-data-sync when starting the app
         */
        _this.downloadOnStart = false;
        /**
         * If true, only execute sync when WLAN is available
         */
        _this.downloadWlan = true;
        if (id == 0) {
            var userLang = navigator.language.split("-")[0]; // use navigator lang if available
            userLang = /(de|en|it)/gi.test(userLang) ? userLang : "en";
            _this.language = userLang;
        }
        return _this;
    }
    /**
     * Find settings object by given user, if it does not exist yet, creates a new instance with default settings values.
     * @param userId
     * @returns {Promise<Settings>}
     */
    Settings.findByUserId = function (userId) {
        return new Promise(function (resolve, reject) {
            SQLiteDatabaseService.instance().then(function (db) {
                db.query("SELECT * FROM settings WHERE userId = ?", [userId]).then(function (response) {
                    var settings = new Settings();
                    if (response.rows.length == 0) {
                        settings.userId = userId;
                        resolve(settings);
                    }
                    else {
                        settings.readFromObject(response.rows.item(0));
                        resolve(settings);
                    }
                }, function (error) {
                    reject(error);
                });
            });
        });
    };
    /**
     * Returns true if we are on a smartphone AND we have the only download in WLAN BUT (are NOT in Wifi and NOT in Ethernet)
     * @returns {boolean}
     */
    Settings.prototype.shouldntDownloadBecauseOfWLAN = function () {
        return window.hasOwnProperty("cordova") && this.downloadWlan && (Settings.NETWORK.type != "wifi" && Settings.NETWORK.type != "ethernet");
    };
    Settings.prototype.fileTooBig = function (fileObject) {
        var fileSize = parseInt(fileObject.data.fileSize);
        return fileSize > this.downloadSize * 1000 * 1000;
    };
    Settings.prototype.quotaExceeds = function (fileObject) {
        var _this = this;
        //only check files...
        if (fileObject.type != "file") {
            return Promise.resolve(false);
        }
        return FileData.getTotalDiskSpace().then(function (used) {
            var fileSize = parseInt(fileObject.data.fileSize);
            return Promise.resolve(_this.quotaSize * 1000 * 1000 < used + fileSize);
        });
    };
    return Settings;
}(ActiveRecord));
export { Settings };
//# sourceMappingURL=settings.js.map