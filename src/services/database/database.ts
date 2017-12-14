import {ConnectionOptions, ConnectionOptionsReader, createConnection} from "typeorm";
import {Inject, Injectable} from "@angular/core";
import {
  DATABASE_CONFIGURATION_ADAPTER, DatabaseConfigurationAdapter, DatabaseConnection, DatabaseConnectionRegistry,
  DEFAULT_CONNECTION_NAME
} from "./database.api";

/**
 * The Database can be used to get information about a certain connection.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class Database {

  private readonly readyConnections: Array<string> = [];

  constructor(
    @Inject(DATABASE_CONFIGURATION_ADAPTER) private readonly configurationAdapter: DatabaseConfigurationAdapter,
    private readonly registry: DatabaseConnectionRegistry
  ) {
  }

  /**
   * Resolves a promise, when the connection matching the given {@code connectionName}
   * is created and therefore ready to use.
   *
   * A connection can be get with the typeORM function getConnection.
   * For additional usage when a connection is up see http://typeorm.io/#/working-with-entity-manager
   *
   * If no connection name is given, the default connection name is used.
   * @see DEFAULT_CONNECTION_NAME
   *
   * If the given {@code connectionName} is not created yet, it will be created first before
   * resolving a promise.
   *
   * @param {string} connectionName - the connection name to use
   */
  async ready(connectionName: string = DEFAULT_CONNECTION_NAME): Promise<void> {

    if (this.readyConnections.find(it => it === connectionName)) {
      return Promise.resolve();
    }

    this.configurationAdapter.addConnections(this.registry);
    const connection: DatabaseConnection = this.registry.getConnection(connectionName);

    const connectionOptionsReader: ConnectionOptionsReader = new ConnectionOptionsReader({
      root: connection.getDirectory(),
      configName: connection.getFileName()
    });
    const connectionOptions: ConnectionOptions = await connectionOptionsReader.get(connectionName);

    await createConnection(connectionOptions);

    this.readyConnections.push(connectionName);
  }
}
