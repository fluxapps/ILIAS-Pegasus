import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm";

/**
 * Migration for Lernorte 2.0.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class CreateLearnplace implements Migration {

  readonly version: MigrationVersion = new MigrationVersion("V__3");

  async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS Learnplace (" +
                  "objectId INTEGER NOT NULL PRIMARY KEY" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS Visibility (" +
                  "value TEXT NOT NULL PRIMARY KEY" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS Location (" +
                  "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT" +
                  "latitude FLOAT NOT NULL" +
                  "longitude FLOAT NOT NULL" +
                  "elevation FLOAT NOT NULL" +
                  "radius INTEGER NOT NULL" +
                  "FK_learnplace INTEGER NOT NULL" +
      ")"
    );

    await queryRunner.query(
      "CREATE TABLE IF NOT EXISTS Map (" +
                  "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT" +
                  "FK_visibility TEXT NOT NULL" +
                  "FK_learnplace INTEGER NOT NULL" +
      ")"
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE IF EXISTS Map");
    await queryRunner.query("DROP TABLE IF EXISTS Location");
    await queryRunner.query("DROP TABLE IF EXISTS Visibility");
    await queryRunner.query("DROP TABLE IF EXISTS Learnplace");
  }
}
