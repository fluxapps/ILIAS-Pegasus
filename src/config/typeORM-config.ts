import {Injectable} from "@angular/core";
import {DatabaseConfigurationAdapter, DatabaseConnectionRegistry} from "../services/database/database.api";

export const PEGASUS_CONNECTION_NAME: string = "ilias-pegasus";

/**
 * Configuration adapter for typeORM connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class TypeORMConfigurationAdapter implements DatabaseConfigurationAdapter {

  /**
   * Adds the {@link PEGASUS_CONNECTION_NAME} to the registry.
   *
   * @param {DatabaseConnectionRegistry} registry
   */
  addConnections(registry: DatabaseConnectionRegistry): void {
    registry.addConnection(PEGASUS_CONNECTION_NAME)
      .setDirectory("assets/");
  }
}
