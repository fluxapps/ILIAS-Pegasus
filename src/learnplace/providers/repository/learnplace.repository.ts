import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {Injectable, InjectionToken} from "@angular/core";
import {AbstractCRUDRepository, CRUDRepository, RepositoryError} from "../../../providers/repository/repository.api";
import {Database} from "../../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";
import {Optional} from "../../../util/util.optional";
import {Logging} from "../../../services/logging/logging.service";
import {Logger} from "../../../services/logging/logging.api";
import {isDefined} from "ionic-angular/es2015/util/util";

/**
 * Describes a CRUD repository for {@link LearnplaceEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
export interface LearnplaceRepository extends CRUDRepository<LearnplaceEntity, string> {

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
export class TypeORMLearnplaceRepository extends AbstractCRUDRepository<LearnplaceEntity, string> implements LearnplaceRepository {

    private logger: Logger = Logging.getLogger(TypeORMLearnplaceRepository.name);

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

            this.logger.trace(() => `Find learnplace by object id and user id: objectId=${objectId}, userId=${userId}`);

            /*
             * This is a workaround. Due an unknown issue, the relations of a learnplace are not loaded
             * by using query builder. Therefore we just read the raw data and invoke the find method
             * with the primary key, where the relations will be loaded.
             */
            const rawLearnplace: RawLearnplace | null = await this.connection
                .getRepository(this.getEntityName())
                .createQueryBuilder( "learnplace")
                .where("learnplace.objectId = :objectId AND learnplace.FK_user = :userId", {objectId: objectId, userId: userId})
                .getRawOne();

            if(isDefined(rawLearnplace) && isDefined(rawLearnplace.learnplace_id)) {
                return this.find(rawLearnplace.learnplace_id);
            }

            return Optional.empty();

        } catch(error) {
            this.logger.warn(() => `Could not load learnplace by object id and user id: objectId=${objectId}, userId=${userId}`);
            this.logger.debug(() => `Find learnplace by object id and user id Error: ${JSON.stringify(error)}`);
            throw new RepositoryError(Logging.getMessage(error,
                `Could not load learnplace by object id and user id: objectId=${objectId}, userId=${userId}`)
            );
        }
    }

    protected getEntityName(): string { return "Learnplace" }

    protected getIdName(): string { return "id" }
}

interface RawLearnplace {
    learnplace_id: string;
    learnplace_objectId: number;
    learnplace_FK_user: number
}
