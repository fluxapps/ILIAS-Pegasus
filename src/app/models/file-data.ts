import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {User} from "./user";

/**
 * Holds additional meta data for ILIAS file objects
 */
export class FileData extends ActiveRecord<FileData> {

    /**
     * Internal ID of the corresponding ILIASObject
     */
    iliasObjectId: number;

    /**
     * File name, including file extension
     */
    fileName: string;

    /**
     * File size in bytes
     */
    fileSize: number;

    /**
     * File type, e.g. application/pdf
     */
    fileType: string;

    /**
     * Extension, e.g. pdf
     */
    fileExtension: string;

    /**
     * Last version date (create date of file object) in ILIAS
     */
    fileVersionDate: string;

    /**
     * Last version date from file on device
     * Note: This date is set to fileVersionDate after a successful download. Meaning: If the date is set, the file
     * is also existing on the local device. If fileVersionDate > fileVersionDateLocal, a new version is available in ILIAS
     */
    fileVersionDateLocal: string;

    /**
     * status of the learning progress (equivalent to whether the file has been downloaded or not)
     */
    fileLearningProgress: boolean;

    /**
     * is true when the learning progress must be synced with the ILIAS-installation
     */
    fileLearningProgressPushToServer: boolean;

    constructor(id: number = 0) {
        super(id, new SQLiteConnector("files", [
            "iliasObjectId",
            "fileName",
            "fileSize",
            "fileType",
            "fileExtension",
            "fileVersionDate",
            "fileVersionDateLocal",
            "fileLearningProgress",
            "fileLearningProgressPushToServer"
        ]));
    }

    needsDownload(): boolean {
        if (!this.hasOwnProperty("fileVersionDateLocal")) {
            return true;
        }
        if (!this.fileVersionDateLocal) {
            return true;
        }
        return (Date.parse(this.fileVersionDate) > Date.parse(this.fileVersionDateLocal));
    }

    /**
     * Get FileData object by corresponding internal ID of an ILIASObject
     * @param iliasObjectId
     * @returns {Promise<FileData>}
     */
    static find(iliasObjectId: number): Promise<FileData> {
        return SQLiteDatabaseService.instance()
            .then(db => {
                return db.query("SELECT * FROM files WHERE iliasObjectId = ?", [iliasObjectId]);
            })
            .then((response: any) => {
                const fileData: FileData = new FileData();
                if (response.rows.length == 0) {
                    fileData.iliasObjectId = iliasObjectId;
                } else {
                    fileData.readFromObject(response.rows.item(0));
                }
                return Promise.resolve(fileData);
            });
    }

    /**
     * Calculate the used disk space of the given user
     * @param user
     * @returns {Promise<number>}
     */
    static getTotalDiskSpaceForUser(user: User): Promise<number> {
        return SQLiteDatabaseService.instance()
            .then(db => {
                return db.query("SELECT SUM(files.fileSize) AS diskSpace FROM users " +
                    "INNER JOIN objects ON objects.userId = users.id " +
                    "INNER JOIN files ON files.iliasObjectId = objects.id " +
                    "WHERE users.id = ? AND objects.isOfflineAvailable = 1 GROUP BY users.id", [user.id]);
            })
            .then((response: any) => {
                let diskSpace: number = 0;
                if (response.rows.length) {
                    diskSpace = response.rows.item(0).diskSpace;
                }
                return Promise.resolve(diskSpace);
        });
    }

    /**
     * Returns the total disk space used by files on this device over all users and installations
     * @returns {Promise<number>}
     */
    static getTotalDiskSpace(): Promise<number> {
        return SQLiteDatabaseService.instance()
            .then(db => {
                return db.query("SELECT * FROM files WHERE fileVersionDateLocal is NOT NULL");
            })
            .then((response: any) => {
                let usedDiskSpace: number = 0;
                for (let i: number = 0; i < response.rows.length; i++) {
                    usedDiskSpace += response.rows.item(i).fileSize;
                }
                return Promise.resolve(usedDiskSpace);
            });
    }

    /**
     * Returns an array of FileData-objects with unsynced learning progresses, so
     * fileLearningProgress is TRUE and fileLearningProgressPushToServer is TRUE
     */
    static async getOpenLearningProgressPosts(): Promise<Array<FileData>> {
        const sql: string = "SELECT iliasObjectId FROM files WHERE fileLearningProgressPushToServer = TRUE";
        const response: any = await SQLiteDatabaseService.instance().then(db => db.query(sql));

        const unsynced: Array<FileData> = [];
        for (let i: number = 0; i < response.rows.length; i++) {
            const fd: FileData = await FileData.find(response.rows.item(i).iliasObjectId);
            unsynced.push(fd);
        }

        return unsynced;
    }

    /**
     * Returns true if there is a local file version but it is no longer up to date
     * @returns {boolean}
     */
    isUpdated(): boolean {
        return this.hasOwnProperty("fileVersionDateLocal") && this.fileVersionDateLocal && this.needsDownload();
    }

}
