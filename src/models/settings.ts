import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {Network} from "@ionic-native/network";
import {FileData} from "./file-data";
import {ILIASObject} from "./ilias-object";

export class Settings extends ActiveRecord {

    static NETWORK: Network;

    /**
     * Internal userId
     */
    userId: number;

    /**
     * Language for app
     */
    language: string = "de";

    /**
     * Max. allowed size for automatic downloads (mega bytes)
     */
    downloadSize: number = 10;

    /**
     * Max. allowed quota for all files the app is storing (mega bytes)
     */
    quotaSize: number = 300;

    /**
     * If true, only execute sync when WLAN is available
     */
    downloadWlan: boolean = true;

    constructor(id = 0) {
        super(id, new SQLiteConnector("settings", [
            "userId",
            "language",
            "downloadSize",
            "quotaSize",
            "downloadWlan"
        ]));

        if(id == 0) {
            let userLang = navigator.language.split("-")[0]; // use navigator lang if available
            userLang = /(de|en|it)/gi.test(userLang) ? userLang : "en";

            this.language = userLang;
        }
    }

    /**
     * Find settings object by given user, if it does not exist yet, creates a new instance with default settings values.
     * @param userId
     * @returns {Promise<Settings>}
     */
    static findByUserId(userId: number): Promise<Settings> {
        return new Promise((resolve, reject) => {
            SQLiteDatabaseService.instance().then(db => {
                db.query("SELECT * FROM settings WHERE userId = ?", [userId]).then((response) => {
                    const settings = new Settings();
                    if (response.rows.length == 0) {
                        settings.userId = userId;
                        resolve(settings);
                    } else {
                        settings.readFromObject(response.rows.item(0));
                        resolve(settings);
                    }
                }, (error) => {
                    reject(error);
                });
            });
        });
    }

    /**
     * Returns true if we are on a smartphone AND we have the only download in WLAN BUT (are NOT in Wifi and NOT in Ethernet)
     * @returns {boolean}
     */
    shouldntDownloadBecauseOfWLAN(): boolean {
        return window.hasOwnProperty("cordova") && this.downloadWlan && (Settings.NETWORK.type != "wifi" && Settings.NETWORK.type != "ethernet");

    }

    fileTooBig(fileObject: ILIASObject): boolean {
        const fileSize = parseInt(fileObject.data.fileSize);
            return fileSize > this.downloadSize * 1000 * 1000;
    }

    quotaExceeds(fileObject: ILIASObject): Promise<boolean> {
            //only check files...
            if(fileObject.type != "file") {
            return Promise.resolve(false);
        }

        return FileData.getTotalDiskSpace().then( used => {
            const fileSize = parseInt(fileObject.data.fileSize);
            return Promise.resolve(this.quotaSize * 1000 * 1000 < used + fileSize);
        });
    }
}
