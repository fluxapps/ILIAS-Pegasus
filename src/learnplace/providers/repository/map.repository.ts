import {CRUDRepository} from "./repository.api";
import {MapEntity} from "../../entity/map.entity";
import {Injectable, InjectionToken} from "@angular/core";

/**
 * Describes a CRUD repository for {@link MapEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MapRepository extends CRUDRepository<MapEntity, number> {

  /**
   * Searches a {@link MapEntity} related with the given {@code learnplaceId}.
   *
   * @param {number} learnplaceId - id of the learnplace relation
   *
   * @returns {Promise<MapEntity>} - the resulting entity
   */
  findByLearnplaceId(learnplaceId: number): Promise<MapEntity>
}
const MAP_REPOSITORY: InjectionToken<MapRepository> = new InjectionToken("token for map repository");

/**
 * Uses TypeORM for CRUD operations of the {@link MapEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class TypeORMMapRepository implements MapRepository {

  findByLearnplaceId(learnplaceId: number): Promise<MapEntity> {
    throw new Error("This method is not implemented yet");
  }

  save(entity: MapEntity): Promise<MapEntity> {
    throw new Error("This method is not implemented yet");
  }

  find(primaryKey: number): Promise<MapEntity> {
    throw new Error("This method is not implemented yet");
  }

  delete(entity: MapEntity): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}
