import {File} from "@ionic-native/file";
import {Injectable} from "@angular/core";
import {DatabaseConfigurationAdapter, DatabaseConnectionRegistry} from "../services/database/database.api";

export const PEGASUS_CONNECTION_NAME: string = "ilias-pegasus";

/**
 * Configuraten adapter for typeORM connections
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class TypeORMConfigurationAdapter implements DatabaseConfigurationAdapter {

  constructor(
    private readonly file: File
  ) {}

  addConnections(registry: DatabaseConnectionRegistry): void {
    registry.addConnection(PEGASUS_CONNECTION_NAME)
      .setDirectory("assets/");
  }
}
