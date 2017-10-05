
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
            console.log(`Could not alter table objects with column 'hasPageLayout': ${JSON.stringify(error)}`)
          });

          const alterTimeline: Promise<any> = db.query(
            "ALTER TABLE objects " +
            "ADD hasTimeline BOOLEAN NOT NULL DEFAULT 0 CHECK (hasTimeline IN (0,1))"
          ).then(() => {
            console.log("Alter table objects with column 'hasTimeline'");
          }, (error) => {
            console.debug(`Could not alter table objects with column 'hasTimeline': ${JSON.stringify(error)}`)
          });

          const alterPermissionType: Promise<any> = db.query(
            "ALTER TABLE objects " +
            "ADD permissionType TEXT NOT NULL DEFAULT 'visible'"
          ).then(() => {
            console.log("Alter table objects with column 'permissionType'");
          }, (error) => {
            console.log(`Could not alter table objects with column 'permissionType': ${JSON.stringify(error)}`)
          });

          Promise.all([alterPageLayout, alterTimeline, alterPermissionType]).then(() => {
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
          console.log(`Could not alter table objects: drop column 'hasPageLayout', error=${JSON.stringify(error)}`)
        });

        const alterTimeline: Promise<any> = db.query("ALTER TABLE objects " +
          "DROP COLUMN hasTimeline"
        ).then(() => {
          console.log("Alter table objects: drop column 'hasTimeline'");
        }, (error) => {
          console.log(`Could not alter table objects: drop column 'hasTimeline', error=${JSON.stringify(error)}`)
        });

        const alterPermissionType: Promise<any> = db.query("ALTER TABLE objects " +
          "DROP COLUMN permissionType"
        ).then(() => {
          console.log("Alter table objects: drop column 'permissionType'");
        }, (error) => {
          console.log(`Could not alter table objects: drop column 'permissionType', error=${JSON.stringify(error)}`)
        });

        Promise.all([alterPageLayout, alterTimeline, alterPermissionType]).then(() => {
          resovle();
        }).catch((error) => {
          reject(error);
        });
      })
    });
  }
}
