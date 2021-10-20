import {AccordionEntity} from "../../../entity/learnplace/accordion.entity";
import {LearnplaceEntity} from "../../../entity/learnplace/learnplace.entity";
import {Injectable, InjectionToken} from "@angular/core";
import {AbstractCRUDRepository, CRUDRepository, RepositoryError} from "../../../providers/repository/repository.api";
import {Database} from "../../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";
import {Optional} from "../../../util/util.optional";
import {Logging} from "../../../services/logging/logging.service";
import {Logger} from "../../../services/logging/logging.api";
import {isDefined} from "../../../util/util.function";
import {LinkblockEntity} from "../../../entity/learnplace/linkblock.entity";
import {PictureBlockEntity} from "../../../entity/learnplace/pictureBlock.entity";
import {TextblockEntity} from "../../../entity/learnplace/textblock.entity";
import {VideoBlockEntity} from "../../../entity/learnplace/videoblock.entity";

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

    private readonly textBlockRepository: TypeORMTextBlockRepositoryRepository;
    private readonly pictureBlockRepository: TypeORMPictureBlockRepositoryRepository;
    private readonly linkBlockRepository: TypeORMLinkBlockRepositoryRepository;
    private readonly videoBlockRepository: TypeORMVideoBlockRepositoryRepository;
    private readonly accordionRepository: TypeORMAccordionBlockRepositoryRepository;

    constructor(database: Database) {
        super(database, PEGASUS_CONNECTION_NAME);

        this.textBlockRepository = new TypeORMTextBlockRepositoryRepository(database, PEGASUS_CONNECTION_NAME);
        this.pictureBlockRepository = new TypeORMPictureBlockRepositoryRepository(database, PEGASUS_CONNECTION_NAME);
        this.linkBlockRepository = new TypeORMLinkBlockRepositoryRepository(database, PEGASUS_CONNECTION_NAME);
        this.videoBlockRepository = new TypeORMVideoBlockRepositoryRepository(database, PEGASUS_CONNECTION_NAME);
        this.accordionRepository = new TypeORMAccordionBlockRepositoryRepository(database, PEGASUS_CONNECTION_NAME);
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

    async delete(entity: LearnplaceEntity): Promise<void> {

        // workaround cascade delete bug

        entity.accordionBlocks.forEach(accordion => {
            accordion.textBlocks.forEach(it => this.textBlockRepository.delete(it));
            accordion.pictureBlocks.forEach(it => this.pictureBlockRepository.delete(it));
            accordion.linkBlocks.forEach(it => this.linkBlockRepository.delete(it));
            accordion.videoBlocks.forEach(it => this.videoBlockRepository.delete(it));
        });

        entity.textBlocks.forEach(it => this.textBlockRepository.delete(it));
        entity.pictureBlocks.forEach(it => this.pictureBlockRepository.delete(it));
        entity.linkBlocks.forEach(it => this.linkBlockRepository.delete(it));
        entity.videoBlocks.forEach(it => this.videoBlockRepository.delete(it));
        entity.accordionBlocks.forEach(it => this.accordionRepository.delete(it));

        return super.delete(entity);
    }

    protected getEntityName(): string { return "Learnplace" }

    protected getIdName(): string { return "id" }
}

interface RawLearnplace {
    learnplace_id: string;
    learnplace_objectId: number;
    learnplace_FK_user: number
}

class TypeORMTextBlockRepositoryRepository extends AbstractCRUDRepository<TextblockEntity, number> {

    protected getEntityName(): string {
        return "TextBlock";
    }

    protected getIdName(): string {
        return "id";
    }
}

class TypeORMPictureBlockRepositoryRepository extends AbstractCRUDRepository<PictureBlockEntity, number> {

    protected getEntityName(): string {
        return "PictureBlock";
    }

    protected getIdName(): string {
        return "id";
    }
}

class TypeORMLinkBlockRepositoryRepository extends AbstractCRUDRepository<LinkblockEntity, number> {

    protected getEntityName(): string {
        return "LinkBlock";
    }

    protected getIdName(): string {
        return "id";
    }
}

class TypeORMVideoBlockRepositoryRepository extends AbstractCRUDRepository<VideoBlockEntity, number> {

    protected getEntityName(): string {
        return "VideoBlock";
    }

    protected getIdName(): string {
        return "id";
    }
}

class TypeORMAccordionBlockRepositoryRepository extends AbstractCRUDRepository<AccordionEntity, number> {

    protected getEntityName(): string {
        return "Accordion";
    }

    protected getIdName(): string {
        return "id";
    }
}
