import {Injectable, InjectionToken} from "@angular/core";

export const DEFAULT_CONNECTION_NAME: string = "default";
const DEFAULT_CONFIG_FILE: string = "ormconfig.json";

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
 *
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class DatabaseConnectionRegistry {

  private readonly connections: Map<string, DatabaseConnection> = new Map();

  addConnection(name: string = DEFAULT_CONNECTION_NAME): DatabaseConnection {
    const connection: DatabaseConnection = new DatabaseConnection();
    this.connections.set(name, connection);
    return connection;
  }

  getConnection(name: string = DEFAULT_CONNECTION_NAME): DatabaseConnection {
    try {
      return this.connections.get(name);
    } catch (error) {
      throw new RangeError(`Could not find a connection with name: ${name}`);
    }
  }
}

/**
 * Data class for database connection information.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 *
 * @property {string} filename        - the file name of your orm config file, by default {@link DEFAULT_CONNECTION_NAME}
 * @property {string} directory       - absolute path to the directory of your config file, by default process.cwd()
 */
export class DatabaseConnection {

  private fileName: string = DEFAULT_CONFIG_FILE;
  private directory: string = process.cwd();


  getFileName(): string {
    return this.fileName;
  }

  setFileName(value: string): DatabaseConnection {
    this.fileName = value;
    return this;
  }

  getDirectory(): string {
    return this.directory;
  }

  setDirectory(value: string): DatabaseConnection {
    this.directory = value;
    return this;
  }
}
