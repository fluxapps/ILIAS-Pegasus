import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner, Table, TableColumn} from "typeorm/browser";

/**
 * migration for learning modules
 *
 * @version 1.0.0
 */
export class CreateLearningModulesSchema implements Migration {
    readonly version: MigrationVersion = new MigrationVersion("V__9");

    async up(queryRunner: QueryRunner): Promise<void> {
        const learningModule: Table = new Table("learning_modules", [
            new TableColumn({name: "id", type: "integer", isPrimary: true, isGenerated: true, isNullable: false}),
            new TableColumn({name: "objId", type: "integer",  isPrimary: false, isNullable: false}),
            new TableColumn({name: "userId", type: "integer", isNullable: false}),
            new TableColumn({name: "relativeStartFile", type: "string", isNullable: false}),
            new TableColumn({name: "timestamp", type: "integer", isNullable: false}),
        ]);

        await queryRunner.createTable(learningModule);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("learning_modules");
    }
}
