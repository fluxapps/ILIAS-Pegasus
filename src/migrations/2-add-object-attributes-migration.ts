
import {BaseMigration} from "./migration";
import {SQLiteDatabaseService} from "../services/database.service";

export class AddObjectAttributesMigration
  extends BaseMigration {

  up(): Promise<any> {
    return new Promise((resolve, reject) => {

        SQLiteDatabaseService.instance().then(db => {

          db.query(
            "ALTER TABLE objects " +
            "ADD hasPageLayout BOOLEAN NOT NULL DEFAULT 0 CHECK (hasPageLayout IN (0,1))"
          ).then(() => {
            resolve()
          }).catch((error) => {
            reject(error)
          })
        })
    });
  }

  down(): Promise<any> {
    return new Promise((resovle, reject) => {

      SQLiteDatabaseService.instance().then(db => {

        db.query("ALTER TABLE objects " +
          "DROP COLUMN hasPageLayout"
        ).then(() => {
          resovle()
        }).catch(error => {
          reject(error)
        })
      })
    });
  }
}
