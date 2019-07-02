/** angular */
import {Injectable, InjectionToken} from "@angular/core";
/** logging */
import {Logging} from "../../../services/logging/logging.service";
/** misc */
import {Database} from "../../../services/database/database";
import {MapEntity} from "../../entity/map.entity";
import {AbstractCRUDRepository, CRUDRepository, RepositoryError} from "../../../providers/repository/repository.api";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";
import {Optional} from "../../../util/util.optional";

/**
 * Describes a CRUD repository for {@link MapEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
export interface MapRepository extends CRUDRepository<MapEntity, number> {

  /**
   * Searches a {@link MapEntity} related with the given {@code learnplaceId}.
   *
   * @param {number} learnplaceId - id of the learnplace relation
   *
   * @returns {Promise<Optional<MapEntity>>} - an Optional of the resulting entity
   * @throws {RepositoryError} if an error occurs during this operation
   */
  findByLearnplaceId(learnplaceId: number): Promise<Optional<MapEntity>>
}

/**
 * Uses TypeORM for CRUD operations of the {@link MapEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
@Injectable({
    providedIn: "root"
})
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
   * @returns {Promise<Optional<MapEntity>>} - an Optional of the resulting entity
   * @throws {RepositoryError} if an error occurs during this operation
   */
  async findByLearnplaceId(learnplaceId: number): Promise<Optional<MapEntity>> {

    try {

      await this.database.ready(PEGASUS_CONNECTION_NAME);

      const result: MapEntity | null = await this.connection
        .createQueryBuilder()
        .select()
        .from(MapEntity, "map")
        .where("map.FK_learnplace = :learnplaceId", {learnplaceId: learnplaceId})
        .getOne();

      return Optional.ofNullable(result);

    } catch (error) {
      throw new RepositoryError(Logging.getMessage(error, `Could not find MapEntity by learnplaceId "${learnplaceId}"`));
    }
  }

  protected getEntityName(): string { return MapEntity.name }

  protected getIdName(): string { return "id" }
}
export const MAP_REPOSITORY: InjectionToken<MapRepository> = new InjectionToken("token for TypeORM map repository");
