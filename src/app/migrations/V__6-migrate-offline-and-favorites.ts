/**
 * Adds additional attributes on the users and settings tables
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class MigrateOfflineAndFavorites implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__6");

    async up(queryRunner: QueryRunner): Promise<void> {

        // favorites as in previous version no longer exist
        await queryRunner.query(
            "UPDATE objects " +
            "SET isFavorite=0"
        );

        // offline data in the previous version now are the favorites
        await queryRunner.query(
            "UPDATE objects " +
            "SET isFavorite=1 WHERE isOfflineAvailable=1"
        );

    }

    async down(queryRunner: QueryRunner): Promise<void> {
        // the changes cannot be undone, because the favorites from before the up-migration are lost
        return;
    }
}
