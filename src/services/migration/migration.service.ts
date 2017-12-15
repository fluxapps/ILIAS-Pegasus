import {Connection, getConnection} from "typeorm";
import {Inject, Injectable} from "@angular/core";
import {PEGASUS_CONNECTION_NAME} from "../../config/typeORM-config";
import {DBMigration, MIGRATION_SUPPLIER, MigrationSupplier} from "./migration.api";

/**
 * DB Migration with TypeORM.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
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
      await connection.runMigrations();
      console.log("finish migration");
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

      for(;currentStep < steps; currentStep++) {
        await connection.undoLastMigration();
      }

    } catch (error) {
      throw new MigrationError(`Could not revert step ${currentStep}`);
    }
  }
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
