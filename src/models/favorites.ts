import {ILIASObject} from "./ilias-object";
import {SQLiteDatabaseService} from "../services/database.service";

export class Favorites {

    public static findByUserId(userId:number):Promise<ILIASObject[]> {
        return SQLiteDatabaseService.instance()
            .then(db => db.query('SELECT * FROM objects WHERE isFavorite = 1 AND userId = ? ORDER BY title ASC', [userId]))
            .then((response) => {
                let favorites = [];
                for (let i = 0; i < (<any> response).rows.length; i++) {
                    favorites.push(ILIASObject.find(<number> (<any> response).rows.item(i).id))
                }
                return Promise.all(favorites);
            });
    }

}