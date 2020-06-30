/**
 * Adds additional attributes on the users and settings tables
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class UpdateUserSettingsSyncSchema implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__5");

    async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            "ALTER TABLE users " +
            "ADD lastVersionLogin TEXT DEFAULT '2.0.0'"
        );

        await queryRunner.query(
            "ALTER TABLE settings " +
            "ADD downloadOnStart INTEGER DEFAULT 0"
        );

        await queryRunner.query(
            "ALTER TABLE synchronization " +
            "ADD recursiveSyncRunning INTEGER DEFAULT 0"
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        return;
    }
}
