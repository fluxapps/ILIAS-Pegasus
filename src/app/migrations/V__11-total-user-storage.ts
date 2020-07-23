/**
 * Adds additional attributes on the users and settings tables
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class TotalUserStorage implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__11");

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE users " +
            "ADD totalUsedStorage INTEGER"
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE users " +
            "DROP totalUsedStorage"
        );
    }
}
