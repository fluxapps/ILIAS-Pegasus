/**
 * Removes unused legacy fields from the object table:
 * - offlineAvailableOwner
 * - isNew
 * - isUpdated
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class RemoveLegacyObjectsFields implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__12");

    async up(queryRunner: QueryRunner): Promise<void> {
        try {
            // sqlite does not support the ALTER TABLE "" DROP COLUMN ""; statement ...
            await queryRunner.startTransaction();
            await queryRunner.query("CREATE TABLE IF NOT EXISTS migration_objects ( " +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "userId INTEGER," +
                "objId INTEGER," +
                "refId INTEGER," +
                "parentRefId INTEGER," +
                "type TEXT," +
                "title TEXT," +
                "description TEXT," +
                "link TEXT," +
                "isOfflineAvailable INTEGER," +
                "isFavorite INTEGER," +
                "data TEXT," +
                "repoPath TEXT," +
                "needsDownload INTEGER," +
                "hasPageLayout BOOLEAN NOT NULL DEFAULT 0 CHECK (hasPageLayout IN (0,1))," +
                "hasTimeline BOOLEAN NOT NULL DEFAULT 0 CHECK (hasTimeline IN (0,1))," +
                "permissionType TEXT NOT NULL DEFAULT 'visible'," +
                "createdAt DATETIME DEFAULT CURRENT_TIMESTAMP," +
                "updatedAt DATETIME" +
                ");");

            await queryRunner.query("" +
                "INSERT INTO migration_objects(id, userId, objId, refId, parentRefId, type, title, description, link, isOfflineAvailable, isFavorite, data, repoPath, needsDownload, hasPageLayout, hasTimeline, permissionType, createdAt, updatedAt) " +
                "SELECT id, userId, objId, refId, parentRefId, type, title, description, link, isOfflineAvailable, isFavorite, data, repoPath, needsDownload, hasPageLayout, hasTimeline, permissionType, createdAt, updatedAt " +
                "FROM objects;");

            await queryRunner.query("DROP TABLE objects;");
            await queryRunner.query("ALTER TABLE migration_objects RENAME TO objects;");

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE objects " +
            "ADD totalUsedStorage TEXT"
        );
    }


}
