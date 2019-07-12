import { ILIASObject } from "./ilias-object";
import { SQLiteDatabaseService } from "../services/database.service";
var Favorites = /** @class */ (function () {
    function Favorites() {
    }
    Favorites.findByUserId = function (userId) {
        return SQLiteDatabaseService.instance()
            .then(function (db) { return db.query("SELECT * FROM objects WHERE isFavorite > 0 AND userId = ? ORDER BY title ASC", [userId]); })
            .then(function (response) {
            var favorites = [];
            for (var i = 0; i < response.rows.length; i++) {
                favorites.push(ILIASObject.find(response.rows.item(i).id));
            }
            return Promise.all(favorites);
        });
    };
    return Favorites;
}());
export { Favorites };
//# sourceMappingURL=favorites.js.map