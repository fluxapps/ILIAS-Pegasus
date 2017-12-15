import {InjectionToken} from "@angular/core";
import {QueryRunner} from "typeorm";

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
   * Returns all migrations in the order they must be executed.
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
