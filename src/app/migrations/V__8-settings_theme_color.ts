/**
 * Adds additional attributes on the files tables
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class SettingsThemeColor implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__8");

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE settings " +
            "ADD themeColorHex TEXT"
        );

        await queryRunner.query(
            "ALTER TABLE settings " +
            "ADD themeColorBright BOOLEAN"
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE settings " +
            "DROP themeColorHex"
        );

        await queryRunner.query(
            "ALTER TABLE settings " +
            "DROP themeColorBright"
        );
    }
}
