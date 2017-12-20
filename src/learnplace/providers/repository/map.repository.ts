import {MapEntity} from "../../entity/map.entity";
import {Injectable, InjectionToken} from "@angular/core";
import {AbstractCRUDRepository, CRUDRepository} from "../../../providers/repository/repository.api";
import {Database} from "../../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";

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

/**
 * Uses TypeORM for CRUD operations of the {@link MapEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class TypeORMMapRepository extends AbstractCRUDRepository<MapEntity, number> implements MapRepository {

  constructor(database: Database) {
    super(database, PEGASUS_CONNECTION_NAME);
  }

  /**
   * Searches a {@link MapEntity} related with the given {@code learnplaceId}.
   *
   * The entity is found by TypeORMs query builder.
   *
   * @param {number} learnplaceId - id of the learnplace relation
   *
   * @returns {Promise<MapEntity>} - the resulting entity
   */
  async findByLearnplaceId(learnplaceId: number): Promise<MapEntity> {

    await this.database.ready(PEGASUS_CONNECTION_NAME);

    return this.connection
      .createQueryBuilder()
      .select()
      .from(MapEntity, "map")
      .where("map.FK_learnplace = :learnplaceId", {learnplaceId: learnplaceId})
      .getOne();
  }

  protected getEntityName(): string { return MapEntity.name }

  protected getIdName(): string { return "id" }
}
export const MAP_REPOSITORY: InjectionToken<MapRepository> = new InjectionToken("token for TypeORM map repository");
