import {ActiveRecord, SQLiteConnector} from "./active-record";
import {SQLiteDatabaseService} from "../services/database.service";
import {ILIASObject} from "./ilias-object";
import {Log} from "../services/log.service";

export class DesktopItem extends ActiveRecord {
    /**
     * Internal user-ID
     */
    public userId:number;

    /**
     * ILIAS Object-ID
     */
    public objId:number;

    constructor(id = 0) {
        super(id, new SQLiteConnector('desktop', [
            'userId',
            'objId',
        ]));
    }

    /**
     * Store all given ILIAS object as DesktopItem for the given user
     * @param userId
     * @param desktopItems
     */
    static storeDesktopItems(userId:number, desktopItems:ILIASObject[]):Promise<any> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query('SELECT * FROM desktop WHERE userId = ?', [userId]))
            .then((response:any) => {
                let existingItems:DesktopItem[] = [];
                let promises = [];
                for (let i = 0; i < response.rows.length; i++) {
                    let desktopItem = new DesktopItem();
                    desktopItem.readFromObject(response.rows.item(i));
                    existingItems.push(desktopItem);
                }
                // Store new delivered desktopItems
                desktopItems.forEach(desktopItem => {
                    let index = existingItems.findIndex(item => {
                        return (item.objId == desktopItem.objId);
                    });
                    if (index == -1) {
                        // Item does not yet exist, create
                        let newDesktopItem = new DesktopItem();
                        newDesktopItem.userId = userId;
                        newDesktopItem.objId = desktopItem.objId;
                        promises.push(newDesktopItem.save());
                    }
                });
                // Delete items no longer delivered
                existingItems.forEach(existingItem => {
                    let index = desktopItems.findIndex(item => {
                        return (item.objId == existingItem.objId);
                    });
                    if (index == -1) {
                        promises.push(existingItem.destroy());
                    }
                });

                return Promise.all(promises);
            });
    }

    /**
     * The overriden method makes sure the save action is atomic. We don't want the same input item twice on the desktop.
     * @returns {Promise<DesktopItem>}
     */
    public save():Promise<number> {
        return this.connector.query('INSERT OR REPLACE INTO ' + this.connector.table + '(userId, objId) VALUES (' + this.userId + ', ' + this.objId + ')')
            .then((response:any) => Promise.resolve(<number> response.insertId))
            .then((newId) => {
            this._id = newId;
            return Promise.resolve(this);
        });
    }

    /**
     * Get ILIAS objects on desktop from a given user
     * @param userId
     * @returns {Promise<ILIASObject[]>}
     */
    static findByUserId(userId:number):Promise<ILIASObject[]> {
        return SQLiteDatabaseService.instance()
            .then(db => {
                let sql =
                    'SELECT objects.* FROM desktop ' +
                    'INNER JOIN objects ON (objects.objId = desktop.objId AND objects.userId = desktop.userId) ' +
                    'WHERE desktop.userId = ?';
                return db.query(sql, [userId])
            }).then((response:any) => {
                let iliasObjectPromises = [];
                for (let i = 0; i < response.rows.length; i++) {
                    iliasObjectPromises.push(ILIASObject.find(response.rows.item(i).id));
                    Log.describe(this, "Desktop item row: ", response.rows.item(i))
                }

                return Promise.all(iliasObjectPromises)
                    .then(desktopItems => desktopItems.sort(ILIASObject.compare));
            });
    }
}