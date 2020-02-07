import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {LearningModulePathBuilder} from "../learningmodule/services/learning-module-path-builder";

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
    async getLocalStartFileUrl(pathBuilder: LearningModulePathBuilder): Promise<string> {
        const localLmDir: string = await pathBuilder.getLmDirByObjId(this.objId);
        return `${localLmDir}${this.relativeStartFile}`;
    }
}
