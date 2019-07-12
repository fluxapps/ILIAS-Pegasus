import {ILIASObject} from "./ilias-object";
import {SQLiteDatabaseService} from "../services/database.service";

export class Favorites {

    static findByUserId(userId: number): Promise<Array<ILIASObject>> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query("SELECT * FROM objects WHERE isFavorite > 0 AND userId = ? ORDER BY title ASC", [userId]))
            .then((response) => {
                const favorites = [];
                for (let i = 0; i < (<any> response).rows.length; i++) {
                    favorites.push(ILIASObject.find(<number> (<any> response).rows.item(i).id))
                }
                return Promise.all(favorites);
            });
    }

}
