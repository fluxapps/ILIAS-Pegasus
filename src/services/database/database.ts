import {createConnection} from "typeorm";
import {Inject, Injectable} from "@angular/core";
import {
  DATABASE_CONFIGURATION_ADAPTER, DatabaseConfigurationAdapter, DatabaseConnection, DatabaseConnectionRegistry,
  DEFAULT_CONNECTION_NAME
} from "./database.api";
import {Http, Response} from "@angular/http";
import {Logger} from "../logging/logging.api";
import {Logging} from "../logging/logging.service";

/**
 * The Database can be used to get information about a certain connection.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
@Injectable()
export class Database {

  private readonly readyConnections: Array<string> = [];

  private readonly log: Logger = Logging.getLogger(Database.name);

  constructor(
    @Inject(DATABASE_CONFIGURATION_ADAPTER) private readonly configurationAdapter: DatabaseConfigurationAdapter,
    private readonly registry: DatabaseConnectionRegistry,
    private readonly http: Http
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

    if (this.readyConnections.findIndex(it => it === connectionName) > 0) {
      this.log.info(() => `Connection ${connectionName} is ready`)
      return Promise.resolve();
    }

    this.configurationAdapter.addConnections(this.registry);
    const connection: DatabaseConnection = this.registry.getConnection(connectionName);

    const file: Response = await this.http.get(connection.getDirectory() + connection.getFileName()).toPromise();

    this.log.info(() => `Create database connection: name=${connectionName}`);
    await createConnection(file.json());

    this.readyConnections.push(connectionName);
  }
}
