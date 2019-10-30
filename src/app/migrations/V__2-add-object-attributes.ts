/**
 * Adds additional attributes on the objects table.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class AddObjectAttributes implements Migration {

  readonly version: MigrationVersion = new MigrationVersion("V__2");

  async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(
      "ALTER TABLE objects " +
      "ADD hasPageLayout BOOLEAN NOT NULL DEFAULT 0 CHECK (hasPageLayout IN (0,1))"
    );

    await queryRunner.query(
      "ALTER TABLE objects " +
      "ADD hasTimeline BOOLEAN NOT NULL DEFAULT 0 CHECK (hasTimeline IN (0,1))"
    );

    await queryRunner.query(
      "ALTER TABLE objects " +
      "ADD permissionType TEXT NOT NULL DEFAULT 'visible'"
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(
      "ALTER TABLE objects " +
      "DROP COLUMN hasPageLayout"
    );

    await queryRunner.query(
      "ALTER TABLE objects " +
      "DROP COLUMN hasTimeline"
    );

    await queryRunner.query(
      "ALTER TABLE objects " +
      "DROP COLUMN permissionType"
    );
  }
}
