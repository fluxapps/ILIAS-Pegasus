
import {BaseMigration} from "./migration";
import {SQLiteDatabaseService} from "../services/database.service";

export class AddObjectAttributesMigration
  extends BaseMigration {

  up(): Promise<any> {
    return new Promise((resolve, reject) => {

        SQLiteDatabaseService.instance().then(db => {

          const alterPageLayout: Promise<any> = db.query(
            "ALTER TABLE objects " +
            "ADD hasPageLayout BOOLEAN NOT NULL DEFAULT 0 CHECK (hasPageLayout IN (0,1))"
          ).then(() => {
            console.log("Alter table objects with column 'hasPageLayout'");
          }, (error) => {
            console.log(`Could not alter table objects with column 'hasPageLayout': ${error}`)
          });

          const alterTimeline: Promise<any> = db.query(
            "ALTER TABLE objects " +
            "ADD hasTimeline BOOLEAN NOT NULL DEFAULT 0 CHECK (hasTimeline IN (0,1))"
          ).then(() => {
            console.log("Alter table objects with column 'hasTimeline'");
          }, (error) => {
            console.log(`Could not alter table objects with column 'hasTimeline': ${error}`)
          });

          Promise.all([alterPageLayout, alterTimeline]).then(() => {
            resolve()
          }).catch((error) => {
            reject(error)
          });
        })
    });
  }

  down(): Promise<any> {
    return new Promise((resovle, reject) => {

      SQLiteDatabaseService.instance().then(db => {

        const alterPageLayout: Promise<any> = db.query("ALTER TABLE objects " +
          "DROP COLUMN hasPageLayout"
        ).then(() => {
          console.log("Alter table objects: drop column 'hasPageLayout'");
        }, (error) => {
          console.log(`Could not alter table objects: drop column 'hasPageLayout', error=${error}`)
        });

        const alterTimeline: Promise<any> = db.query("ALTER TABLE objects " +
          "DROP COLUMN hasTimeline"
        ).then(() => {
          console.log("Alter table objects: drop column 'hasTimeline'");
        }, (error) => {
          console.log(`Could not alter table objects: drop column 'hasTimeline', error=${error}`)
        });

        Promise.all([alterPageLayout, alterTimeline]).then(() => {
          resovle();
        }).catch((error) => {
          reject(error);
        });
      })
    });
  }
}
