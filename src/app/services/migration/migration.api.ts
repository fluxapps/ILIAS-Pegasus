import {InjectionToken} from "@angular/core";
import {QueryRunner} from "typeorm/browser";

const BASE_10: number = 10;
const VERSION_NUMBER: number = 1;

/**
 * Describes a service to handle database migrations.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface DBMigration {

  /**
   * Migrates the database with all found migrations.
   *
   * @throws {MigrationError} if a migration fails
   */
  migrate(): Promise<void>

  /**
   * Reverts the last n steps.
   *
   * @param {number} steps step count to revert
   *
   * @throws {MigrationError} if a revert step fails
   */
  revert(steps: number): Promise<void>
}
export const DB_MIGRATION: InjectionToken<DBMigration> = new InjectionToken("db migration token");

/**
 * Describes a supplier for database migrations.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MigrationSupplier {

  /**
   * Returns all migrations that should be executed.
   *
   * @returns {Promise<Array<Migration>>} the resulting migrations
   */
  get(): Promise<Array<Migration>>
}
export const MIGRATION_SUPPLIER: InjectionToken<MigrationSupplier> = new InjectionToken("migration supplier token");

/**
 * Describes a database migration step.
 * This interface provides
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface Migration {

  readonly version: MigrationVersion;

  /**
   * Runs this migration.
   *
   * @param {QueryRunner} queryRunner - runner to execute sql queries
   *
   * @throws {MigrationError} if the migration fails
   */
  up(queryRunner: QueryRunner): Promise<void>

  /**
   * Reverts this migration.
   *
   * @param {QueryRunner} queryRunner - runner to execute sql queries
   *
   * @throws {MigrationError} if the migration fails
   */
  down(queryRunner: QueryRunner): Promise<void>
}

/**
 * Defines a migration version. This class ensures, that a version has a correct value.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class MigrationVersion {

  private readonly versionNumber: number;

  private readonly pattern: RegExp = new RegExp("^V__(\\d{1,})$");

  constructor(version: string) {

    if (this.pattern.test(version)) {

      const matches: Array<string> = this.pattern.exec(version);
      this.versionNumber = parseInt(matches[VERSION_NUMBER], BASE_10);
    } else {
      throw new MigrationVersionError(`Invalid version number: ${version}`);
    }
  }

  getVersion(): number { return this.versionNumber }
}

/**
 * Indicates a failure during a database migration.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class MigrationError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MigrationError.prototype);
  }
}

/**
 * Indicates a invalid migration version number.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class MigrationVersionError extends MigrationError {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MigrationVersionError.prototype);
  }
}
