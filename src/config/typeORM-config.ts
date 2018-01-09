import {Injectable} from "@angular/core";
import {DatabaseConfigurationAdapter, DatabaseConnectionRegistry} from "../services/database/database.api";
import {VisibilityEntity} from "../learnplace/entity/visibility.entity";
import {LocationEntity} from "../learnplace/entity/location.entity";
import {MapEntity} from "../learnplace/entity/map.entity";
import {LearnplaceEnity} from "../learnplace/entity/learnplace.enity";

export const PEGASUS_CONNECTION_NAME: string = "ilias-pegasus";

/**
 * Configuration adapter for typeORM connections.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
@Injectable()
export class TypeORMConfigurationAdapter implements DatabaseConfigurationAdapter {

  /**
   * Adds the {@link PEGASUS_CONNECTION_NAME} to the registry.
   *
   * @param {DatabaseConnectionRegistry} registry - the database connection registry
   */
  addConnections(registry: DatabaseConnectionRegistry): void {
    registry.addConnection(PEGASUS_CONNECTION_NAME,
        it =>
          it.cordova()
            .setDatabase("ilias_app")
            .setLocation("default")
            .enableLogging(false)
            .addEntity(
              LearnplaceEnity,
              LocationEntity,
              MapEntity,
              VisibilityEntity
            )
    );
  }
}
