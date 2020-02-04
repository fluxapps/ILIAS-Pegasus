import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {UserStorageService} from "../services/filesystem/user-storage.service";

export class LearningModule extends ActiveRecord {
    /**
     * objId of the ILIAS object corresponding to the lm
     */
    objId: number;

    /**
     * usersId identifying the user that uses the lm
     */
    userId: number;

    /**
     * path to the start file of the lm, relative to the root directory of the lm
     */
    relativeStartFile: string;

    /**
     * timestamp of the
     */
    timestamp: number = -1;

    constructor(id: number = 0) {
        super(id, new SQLiteConnector("learning_modules", [
            "objId",
            "userId",
            "relativeStartFile",
            "timestamp",
        ]));
    }

    /**
     * returns the name of the directory where all learning modules are located (without ending /)
     */
    static getAllLmsDirName(): string {
        return "learning_modules";
    }

    /**
     * constructs the name of the root directory for a given learning module (without ending /)
     */
    static getLmDirName(objId: number): string {
        return `lm_${objId}`;
    }

    /**
     * find LearningModule object by given object id and user id, if it does not exist yet, creates a new instance with default values
     */
    static async findByObjIdAndUserId(objId: number, userId: number): Promise<LearningModule> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        const response: any = await db.query("SELECT * FROM learning_modules WHERE objId = ? AND userId = ?", [objId, userId]);
        const lm: LearningModule = new LearningModule();
        if (response.rows.length == 0) {
            lm.objId = objId;
            lm.userId = userId;
            return lm;
        } else {
            lm.readFromObject(response.rows.item(0));
            return lm;
        }
    }

    /**
     * checks if a LearningModule with given object id and user id exists
     */
    static async existsByObjIdAndUserId(objId: number, userId: number): Promise<boolean> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        const response: any = await db.query("SELECT * FROM learning_modules WHERE objId = ? AND userId = ?", [objId, userId]);
        return response.rows.length !== 0;
    }

    /**
     * creates the absolute url to the start file of the learning module
     */
    async getLocalStartFileUrl(userStorage: UserStorageService): Promise<string> {
        const localLmDir: string = await userStorage.dirForUser(`${LearningModule.getAllLmsDirName()}/${LearningModule.getLmDirName(this.objId)}`);
        return `${localLmDir}${this.relativeStartFile}`;
    }
}
