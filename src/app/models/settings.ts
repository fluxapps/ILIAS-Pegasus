/** ionic-native */
import { Network } from "@ionic-native/network/ngx";
/** misc */
import { ActiveRecord, SQLiteConnector } from "./active-record";
import { SQLiteDatabaseService } from "../services/database.service";
import { FileData } from "./file-data";
import { ILIASObject } from "./ilias-object";

export class Settings extends ActiveRecord<Settings> {

    static NETWORK: Network;

    /**
     * Internal userId
     */
    userId: number;

    /**
     * Language for app
     */
    language: string = "fr";

    /**
     * Max. allowed size for automatic downloads (mega bytes)
     */
    downloadSize: number = 10;

    /**
     * Max. allowed quota for all files the app is storing (mega bytes)
     */
    quotaSize: number = 10000;

    /**
     * If true, execute offline-data-sync when starting the app
     */
    downloadOnStart: boolean = false;

    /**
     * If true, only execute sync when WLAN is available
     */
    downloadWlan: boolean = true;

    /**
     * Color that is set in the PegasusHelper-plugin
     */
    themeColorHex: string = "";

    /**
     * Color that is set in the PegasusHelper-plugin
     */
    themeContrastColor: boolean = false;

    /**
     * Time when the currently loaded theme was introduced
     */
    themeTimestamp: number = 0;

    constructor(id: number = 0) {
        super(id, new SQLiteConnector("settings", [
            "userId",
            "language",
            "downloadSize",
            "quotaSize",
            "downloadOnStart",
            "downloadWlan",
            "themeColorHex",
            "themeContrastColor",
            "themeTimestamp"
        ]));

        if (id == 0) {
            let userLang: string = navigator.language.split("-")[0]; // use navigator lang if available
            userLang = /(de|en|it|fr)/gi.test(userLang) ? userLang : "en";

            this.language = userLang;
        }
    }

    /**
     * Find settings object by given user, if it does not exist yet, creates a new instance with default settings values.
     * @param userId
     * @returns {Promise<Settings>}
     */
    static async findByUserId(userId: number): Promise<Settings> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        const response: any = await db.query("SELECT * FROM settings WHERE userId = ?;", [userId]);
        const settings: Settings = new Settings();
        if (response.rows.length === 0) {
            settings.userId = userId;
            return settings;
        } else {
            settings.readFromObject(response.rows.item(0));
            return settings;
        }
    }

    /**
     * Returns true if we are on a smartphone AND we have the only download in WLAN BUT (are NOT in Wifi and NOT in Ethernet)
     * @returns {boolean}
     */
    shouldntDownloadBecauseOfWLAN(): boolean {
        return window.hasOwnProperty("cordova") && this.downloadWlan && (Settings.NETWORK.type !== "wifi" && Settings.NETWORK.type !== "ethernet");

    }

    fileTooBig(fileObject: ILIASObject): boolean {
        const fileSize: number = parseInt(fileObject.data.fileSize, 10);
        return fileSize > this.downloadSize * 1000**2;
    }

    async quotaExceeds(fileObject: ILIASObject): Promise<boolean> {
        //only check files...
        if (fileObject.type !== "file") {
            return false;
        }

        const used: number = await FileData.getTotalDiskSpace();
        const fileSize: number = parseInt(fileObject.data.fileSize, 10);
        return (this.quotaSize * 1000**2) < (used + fileSize);
    }
}
