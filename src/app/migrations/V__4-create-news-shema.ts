import {Migration, MigrationVersion} from "../services/migration/migration.api";
import {QueryRunner, Table, TableColumn} from "typeorm/browser";

/**
 * Migration for News page.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 0.0.1
 */
export class CreateNews implements Migration {

  readonly version: MigrationVersion = new MigrationVersion("V__4");


  async up(queryRunner: QueryRunner): Promise<void> {
    const news: Table = new Table("News", [
      new TableColumn({name: "newsId", type: "integer", isPrimary: true, isGenerated: false, isNullable: false}),
      new TableColumn({name: "newsContext", type: "integer", isNullable: false}),
      new TableColumn({name: "title", type: "string", isNullable: false}),
      new TableColumn({name: "subtitle", type: "string", isNullable: false}),
      new TableColumn({name: "content", type: "string", isNullable: false}),
      new TableColumn({name: "createDate", type: "integer", isNullable: false}),
      new TableColumn({name: "updateDate", type: "integer", isNullable: false}),
    ]);

    const usersNewsJunctionTable: Table = new Table("users_news", [
      new TableColumn({name: "usersId", type: "integer", isPrimary: true,  isGenerated: false, isNullable: false}),
      new TableColumn({name: "newsId", type: "integer", isPrimary: true,  isGenerated: false, isNullable: false})
    ]);

    await queryRunner.createTable(news);
    await queryRunner.createTable(usersNewsJunctionTable);

  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("News");
    await queryRunner.dropTable("users_news");
  }
}
