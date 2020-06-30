/** angular */
import {Inject, Injectable} from "@angular/core";
/** migration */
import {
    DBMigration,
    Migration,
    MIGRATION_SUPPLIER,
    MigrationError,
    MigrationSupplier,
    MigrationVersion
} from "./migration.api";
import {InitDatabase} from "../../migrations/V__1-init-database";
import {AddObjectAttributes} from "../../migrations/V__2-add-object-attributes";
import {CreateLearnplace} from "../../migrations/V__3-create-learnplace-shema";
import {CreateNews} from "../../migrations/V__4-create-news-shema";
import {UpdateUserSettingsSyncSchema} from "../../migrations/V__5-update-user-settings-sync-schema";
import {MigrateOfflineAndFavorites} from "../../migrations/V__6-migrate-offline-and-favorites";
import {FilesLearningProgress} from "../../migrations/V__7-files_learning_progress";
import {SettingsThemeColor} from "../../migrations/V__8-settings_theme_color";
import {AddThemeTimestamp} from "../../migrations/V__9-add_theme_timestamp";
import {CreateLearningModulesSchema} from "../../migrations/V__10-create-learning-modules-schema";
/** logging */
import {Logger} from "../logging/logging.api";
import {Logging} from "../logging/logging.service";
/** misc */
import {Connection, getConnection, QueryRunner} from "typeorm/browser";
import {PEGASUS_CONNECTION_NAME} from "../../config/typeORM-config";

/**
 * DB Migration with TypeORM.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
@Injectable({
    providedIn: "root"
})
export class TypeOrmDbMigration implements DBMigration {

  private readonly log: Logger = Logging.getLogger(TypeOrmDbMigration.name);

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
      migrations.sort((first, second) => first.version.getVersion() - second.version.getVersion());

      for(const it of migrations) {

        const result: Array<{}> = await queryRunner.query("SELECT * FROM migrations WHERE id = ?", [it.version.getVersion()]);
        this.log.debug(() => `Migrations Table result: ${JSON.stringify(result)}`);
        if (result.length < 1) {

          this.log.info(() => `Run database migration: version=${it.version.getVersion()}`);
          await it.up(queryRunner);

          await queryRunner.query("INSERT INTO migrations (id) VALUES (?)", [it.version.getVersion()])
        }
      }

      this.log.info(() => "Successfully migrate database");

    } catch (error) {
      this.log.debug(() => `Database Migration Error: ${JSON.stringify(error)}`);
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

        const migration: Migration = migrations.pop();

        await migration.down(queryRunner);
        await queryRunner.query("DELETE FROM migrations WHERE id = ?", [migration.version.getVersion()])
      }

      this.log.info(() => `Successfully revert ${steps} database migrations`);

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
@Injectable({
    providedIn: "root"
})
export class SimpleMigrationSupplier implements MigrationSupplier {

  /**
   * Returns all migration that are being executed by the {@link DBMigration}.
   *
   * @returns {Promise<Array<Migration>>} the migrations to run
   */
  async get(): Promise<Array<Migration>> {
    return [
      new InitDatabase(),
      new AddObjectAttributes(),
      new CreateLearnplace(),
      new CreateNews(),
      new UpdateUserSettingsSyncSchema(),
      new MigrateOfflineAndFavorites(),
      new FilesLearningProgress(),
      new SettingsThemeColor(),
      new AddThemeTimestamp(),
      new CreateLearningModulesSchema(),
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

  /**
   * Creates the migration table, in which all migrations will be write in.
   *
   * @param {QueryRunner} queryRunner - to execute sql queries
   */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TABLE IF NOT EXISTS migrations (id INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  }

  /**
   * Deletes the migration table.
   *
   * @param {QueryRunner} queryRunner - to execute sql queries
   */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DELETE TABLE migrations");
  }
}
