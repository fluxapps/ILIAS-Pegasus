/** logging */
import { EntityManager } from "typeorm/browser";
import { SQLiteDatabaseService } from "../services/database.service";
import { Logger } from "../services/logging/logging.api";
import { Logging } from "../services/logging/logging.service";
/** misc */
import { ActiveRecord, SQLiteConnector } from "./active-record";
import { ILIASObject } from "./ilias-object";

export class DesktopItem extends ActiveRecord<DesktopItem> {

    private static readonly log: Logger = Logging.getLogger("DesktopItem");

    /**
     * Internal user-ID
     */
    userId: number;

    /**
     * ILIAS Object-ID
     */
    objId: number;

    constructor(id = 0) {
        super(id, new SQLiteConnector("desktop", [
            "userId",
            "objId",
        ]));
    }

    /**
     * Store all given ILIAS object as DesktopItem for the given user
     * @param userId
     * @param desktopItems
     */
    static async storeDesktopItems(userId: number, desktopItems: Array<ILIASObject>): Promise<void> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        const response: any = await db.query("SELECT * FROM desktop WHERE userId = ?", [userId]);
        const existingItems: Array<DesktopItem> = [];

        for (let i: number = 0; i < response.rows.length; i++) {
            const desktopItem: DesktopItem = new DesktopItem();
            desktopItem.readFromObject(response.rows.item(i));
            existingItems.push(desktopItem);
        }

        // Store new delivered desktopItems
        for (const desktopItem of desktopItems) {
            const index: number = existingItems.findIndex(item => {
                return (item.objId == desktopItem.objId);
            });
            if (index == -1) {
                // Item does not yet exist, create
                const newDesktopItem: DesktopItem = new DesktopItem();
                newDesktopItem.userId = userId;
                newDesktopItem.objId = desktopItem.objId;
                await newDesktopItem.save();
            }
        }

        // Delete items no longer delivered
        for (const existingItem of existingItems) {
            const index: number = desktopItems.findIndex(item => {
                return (item.objId == existingItem.objId);
            });
            if (index == -1) {
                await existingItem.destroy();
            }
        }
    }

    /**
     * The overriden method makes sure the save action is atomic. We don't want the same input item twice on the desktop.
     * @returns {Promise<DesktopItem>}
     */
    async save(): Promise<DesktopItem> {
        await this.connector.transaction(async(em: EntityManager) => {
            await em.query(`INSERT OR REPLACE INTO ${this.connector.table}(userId, objId) VALUES (${this.userId}, ${this.objId})`);
            const latestDataEntry: Array<{ id: number }> = await em.query(
                `SELECT * FROM ${this.connector.table} WHERE userId = ? AND objId = ?;`,
                [this.userId, this.objId]
            );
            this._id = latestDataEntry[0].id;
        });
        // const response: unknown = await this.connector.query(`INSERT OR REPLACE INTO ${this.connector.table}(userId, objId) VALUES (${this.userId}, ${this.objId})`);
        // this._id = (response as { insertId: number }).insertId;
        return this;
    }

    /**
     * Get ILIAS objects on desktop from a given user
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    static async findByUserId(userId: number): Promise<Array<ILIASObject>> {
        const db: SQLiteDatabaseService = await SQLiteDatabaseService.instance();
        const sql: string =
            "SELECT objects.* FROM desktop " +
            "INNER JOIN objects ON (objects.objId = desktop.objId AND objects.userId = desktop.userId) " +
            "WHERE desktop.userId = ?";
        const response: any = await db.query(sql, [userId]);
        const desktopItems: Array<ILIASObject> = [];
        for (let i: number = 0; i < response.rows.length; i++) {
            desktopItems.push(await ILIASObject.find(response.rows.item(i).id));
            DesktopItem.log.trace(() => `Desktop item row: ${JSON.stringify(response.rows.item(i))}`);
        }

        return desktopItems.sort(ILIASObject.compare);
    }
}
