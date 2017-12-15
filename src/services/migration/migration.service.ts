import {Connection, getConnection, QueryRunner} from "typeorm";
import {Inject, Injectable} from "@angular/core";
import {PEGASUS_CONNECTION_NAME} from "../../config/typeORM-config";
import {
  DBMigration, Migration, MIGRATION_SUPPLIER, MigrationError, MigrationSupplier,
  MigrationVersion
} from "./migration.api";

/**
 * DB Migration with TypeORM.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
@Injectable()
export class TypeOrmDbMigration implements DBMigration {

  constructor(
    @Inject(MIGRATION_SUPPLIER) private readonly migrationSupplier: MigrationSupplier
  ) {}

  /**
   * Migrates the database with all migrations found by the {@link MigrationSupplier}.
   *
   * @throws {MigrationError} if the migration fails
   */
  async migrate(): Promise<void> {

    try {

      const connection: Connection = getConnection(PEGASUS_CONNECTION_NAME);

      const queryRunner: QueryRunner = connection.createQueryRunner();

      const migrationTable: CreateMigrationTable = new CreateMigrationTable();
      await migrationTable.up(queryRunner);

      const migrations: Array<Migration> = await this.migrationSupplier.get();

      migrations.forEach(async(it) => {

        const result: Array<{}> = await queryRunner.query("SELECT * FROM migrations WHERE id = ?", [it.version.getVersion()]);
        console.log(result);
        if (result.length < 1) {

          await it.up(queryRunner);

          await queryRunner.query("INSERT INTO migrations (id) VALUES (?)", [it.version.getVersion()])
        }
      })

    } catch (error) {
      throw new MigrationError("Could not finish database migration");
    }
  }

  /**
   * Reverts the last n steps with typeORM connection.
   *
   * @param {number} steps - step count to revert
   *
   * @throws {MigrationError} if a revert step fails
   */
  async revert(steps: number): Promise<void> {

    let currentStep: number = 0;

    try {

      const connection: Connection = getConnection(PEGASUS_CONNECTION_NAME);

      const queryRunner: QueryRunner = connection.createQueryRunner();

      const migrations: Array<Migration> = await this.migrationSupplier.get();

      for(;currentStep < steps; currentStep++) {

        const migration: Migration = await migrations.pop();

        await migration.down(queryRunner);
        await queryRunner.query("DELETE FROM migrations WHERE id = ?", [migration.version.getVersion()])
      }

    } catch (error) {
      throw new MigrationError(`Could not revert step ${currentStep}`);
    }
  }
}

/**
 * A simple migration supplier, that supplies migrations,
 * that are created in this class.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class SimpleMigrationSupplier implements MigrationSupplier {

  /**
   * Returns all migration that are being executed by the {@link DBMigration}.
   * The migrations are executed in the order of the returned array.
   *
   * @returns {Promise<Array<Migration>>} the migrations to run
   */
  async get(): Promise<Array<Migration>> {
    return [
      // Add migrations here
    ];
  }
}

/**
 * Special migration, which setups the migration table,
 * to execute further migrations.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
class CreateMigrationTable implements Migration {

  readonly version: MigrationVersion = new MigrationVersion("V__0");

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE IF NOT EXISTS migrations (id INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE TABLE migrations");
  }
}
