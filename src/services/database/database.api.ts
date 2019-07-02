import {Injectable, InjectionToken} from "@angular/core";
import {ConnectionOptions, QueryRunner} from "typeorm";
import {CordovaDatabaseConnection, CordovaDatabaseConnectionImpl} from "./cordova.database";
import {NoSuchElementError} from "../../error/errors";

export const DEFAULT_CONNECTION_NAME: string = "default";

/**
 * Describes a class to configure database connections.
 *
 * Implement this interface and register your connections.
 * Your implementation must be provided with the {@link DATABASE_CONFIGURATION_ADAPTER} inject token
 * in order to be found by the {@link Database} service.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface DatabaseConfigurationAdapter {

  /**
   * Adds connections to the given {@code registry}.
   *
   * @param {DatabaseConnectionRegistry} registry - registry to add database connections
   */
  addConnections(registry: DatabaseConnectionRegistry): void
}
export const DATABASE_CONFIGURATION_ADAPTER: InjectionToken<DatabaseConfigurationAdapter> = new InjectionToken("token for database configurer");

/**
 * Registry to add different types of database connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable({
    providedIn: "root"
})
export class DatabaseConnectionRegistry {

  private readonly connections: Map<string, DatabaseOptions> = new Map();

  addConnection(name: string = DEFAULT_CONNECTION_NAME, options: (it: DatabaseConnection) => DatabaseOptions): void {
    const connection: DatabaseConnection = new DatabaseConnection(name);
    this.connections.set(name, options(connection));
  }

  getConnection(name: string = DEFAULT_CONNECTION_NAME): DatabaseOptions {
    try {
      return this.connections.get(name);
    } catch (error) {
      throw new NoSuchElementError(`Could not find a connection with name: ${name}`);
    }
  }
}

/**
 * Provides specific database connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class DatabaseConnection {

  constructor(
    private readonly name: string
  ) {}

  cordova(): CordovaDatabaseConnection {
    return new CordovaDatabaseConnectionImpl(this.name);
  }
}

/**
 * Base interface for all database connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface DatabaseOptions {

  /**
   * @returns {ConnectionOptions} the connection options of this database connection
   */
  getOptions(): ConnectionOptions
}

/**
 * Provides common database connection options.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface CommonDatabaseOptions<T> extends DatabaseOptions {

  /**
   * Registers all given entities in this connection.
   *
   * @param {Function} first - entity to add
   * @param {Array<Function>} more - additional entities to add
   *
   * @returns {T} the specific database connection
   */
  addEntity(first: Function, ...more: Array<Function>): T

  /**
   * Enables or disable the sql logging of this connection.
   *
   * @param {boolean} enable - true if logging should be enabled, otherwise false
   *
   * @returns {T} the specific database connection
   */
  enableLogging(enable: boolean): T
}

/**
 * Bootstrap database connection.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 * @version 1.0.0
 */
export interface DatabaseBootstraper {

    /**
     * Bootstraps connection after connection is established.
     *
     * @param {QueryRunner} queryRunner The query running which can be used to bootstrap the connection.
     */
    init(queryRunner: QueryRunner): Promise<void>;
}
