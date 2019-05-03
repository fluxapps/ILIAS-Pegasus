/**
 * Initializes the database tables in its first state.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm";

export class InitDatabase implements Migration {

  readonly version: MigrationVersion = new MigrationVersion("V__1");

  async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS users (" +
                  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                  "iliasUserId INTEGER," +
                  "iliasLogin TEXT," +
                  "installationId INTEGER," +
                  "accessToken TEXT," +
                  "refreshToken TEXT," +
                  "lastTokenUpdate INTEGER" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS objects ( " +
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
                  "offlineAvailableOwner TEXT," +
                  "isNew INTEGER," +
                  "isUpdated INTEGER," +
                  "isFavorite INTEGER," +
                  "data TEXT," +
                  "repoPath TEXT," +
                  "needsDownload INTEGER," +
                  "createdAt DATETIME DEFAULT CURRENT_TIMESTAMP," +
                  "updatedAt DATETIME" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS files ( " +
                  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                  "iliasObjectId INTEGER," +
                  "fileName TEXT," +
                  "fileSize INTEGER," +
                  "fileType TEXT," +
                  "fileExtension TEXT," +
                  "fileVersionDate DATETIME," +
                  "fileVersionDateLocal DATETIME" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS desktop ( " +
                  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                  "userId INTEGER," +
                  "objId INTEGER" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS synchronization ( " +
                  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                  "userId INTEGER," +
                  "startDate DATETIME," +
                  "endDate DATETIME," +
                  "recursiveSyncRunning INTEGER" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS settings ( " +
                  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                  "userId INTEGER," +
                  "language TEXT," +
                  "downloadSize INTEGER," +
                  "quotaSize INTEGER," +
                  "downloadOnStart INTEGER," +
                  "downloadWlan INTEGER" +
      ")"
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query("DROP TABLE IF EXISTS users");

    await queryRunner.query("DROP TABLE IF EXISTS objects");

    await queryRunner.query("DROP TABLE IF EXISTS files");

    await queryRunner.query("DROP TABLE IF EXISTS desktop");

    await queryRunner.query("DROP TABLE IF EXISTS synchronization");

    await queryRunner.query("DROP TABLE IF EXISTS settings");
  }
}
