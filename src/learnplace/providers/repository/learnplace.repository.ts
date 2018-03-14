import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {Injectable, InjectionToken} from "@angular/core";
import {AbstractCRUDRepository, CRUDRepository, RepositoryError} from "../../../providers/repository/repository.api";
import {Database} from "../../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";
import {Optional} from "../../../util/util.optional";
import {Logging} from "../../../services/logging/logging.service";

/**
 * Describes a CRUD repository for {@link LearnplaceEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
export interface LearnplaceRepository extends CRUDRepository<LearnplaceEntity, number> {

    /**
     * Finds a learnplace matching the given {@code objectId} and {@code userid}.
     *
     * @param {number} objectId - ILIAS object id of the learnplace
     * @param {number} userId - id of the user where the learnplace belongs to
     *
     * @return {Promise<Optional<LearnplaceEntity>>}
     */
    findByObjectIdAndUserId(objectId: number, userId: number): Promise<Optional<LearnplaceEntity>>
}
export const LEARNPLACE_REPOSITORY: InjectionToken<LearnplaceRepository> = new InjectionToken("token for TypeORM learnplace repository");

/**
 * Uses TypeORM for CRUD operations of the {@link LearnplaceEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
@Injectable()
export class TypeORMLearnplaceRepository extends AbstractCRUDRepository<LearnplaceEntity, number> implements LearnplaceRepository {

  constructor(database: Database) {
    super(database, PEGASUS_CONNECTION_NAME);
  }

    /**
     * Finds a learnplace matching the given {@code objectId} and {@code userid}.
     *
     * @param {number} objectId - ILIAS object id of the learnplace
     * @param {number} userId - id of the user where the learnplace belongs to
     *
     * @return {Promise<Optional<LearnplaceEntity>>}
     */
    async findByObjectIdAndUserId(objectId: number, userId: number): Promise<Optional<LearnplaceEntity>> {

        try {
            await this.database.ready(PEGASUS_CONNECTION_NAME);

            const entity: LearnplaceEntity | null = await this.connection.createQueryBuilder()
                .select()
                .from(LearnplaceEntity, "learnplace")
                .where("learnplace.objectId = :objectId AND learnplace.FK_user = :userId", {objectId: objectId, userId: userId})
                .getOne();

            return Optional.ofNullable(entity);

        } catch(error) {
            throw new RepositoryError(Logging.getMessage(error,
                `Could not load learnplace by object id and user id: objectId=${objectId}, userId=${userId}`)
            );
        }
    }

    protected getEntityName(): string { return "Learnplace" }

    protected getIdName(): string { return "id" }
}
