/**
 * Adds additional attributes on the files tables
 *
 * @author mschneiter <msc@studer-raimann.ch>
 * @version 1.0.0
 */
import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner} from "typeorm/browser";

export class FilesLearningProgress implements Migration {

    readonly version: MigrationVersion = new MigrationVersion("V__7");

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE files " +
            "ADD fileLearningProgress BOOLEAN"
        );

        await queryRunner.query(
            "ALTER TABLE files " +
            "ADD fileLearningProgressPushToServer BOOLEAN"
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            "ALTER TABLE files " +
            "DROP fileLearningProgress"
        );

        await queryRunner.query(
            "ALTER TABLE files " +
            "DROP fileLearningProgressPushToServer"
        );
    }
}
