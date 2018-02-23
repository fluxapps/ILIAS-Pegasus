import {AbstractCRUDRepository, CRUDRepository, RepositoryError} from "../../../providers/repository/repository.api";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
import {Injectable, InjectionToken} from "@angular/core";
import {Database} from "../../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";
import {Logging} from "../../../services/logging/logging.service";
import {Logger} from "../../../services/logging/logging.api";

/**
 * Describes a CRUD repository for {@link VisitJournalEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface VisitJournalRepository extends CRUDRepository<VisitJournalEntity, number> {

  /**
   * @returns {Promise<Array<VisitJournalEntity>>} journal entities, which have the 'synchronized' flag to false
   * @throws {RepositoryError} if the query fails
   */
  findUnsynchronized(): Promise<Array<VisitJournalEntity>>;
}
export const VISIT_JOURNAL_REPOSITORY: InjectionToken<VisitJournalRepository> = new InjectionToken("token for VisitJournalRepository");

/**
 * TypeORM CRUD Repository for {@link VisitJournalEntity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class TypeORMVisitJournalRepository extends AbstractCRUDRepository<VisitJournalEntity, number> implements VisitJournalRepository {

  private readonly logger: Logger = Logging.getLogger(TypeORMVisitJournalRepository.name);

  constructor(database: Database) {
    super(database, PEGASUS_CONNECTION_NAME);
  }

  /**
   * @returns {Promise<Array<VisitJournalEntity>>} journal entities, which have the 'synchronized' flag to false
   * @throws {RepositoryError} if the query fails
   */
  async findUnsynchronized(): Promise<Array<VisitJournalEntity>> {

    try {

      await this.database.ready(PEGASUS_CONNECTION_NAME);

      this.logger.trace(() => "Fetch un-synchronized visit journals");

      return await this.connection
        .getRepository(this.getEntityName())
        .createQueryBuilder("entry")
        .where("entry.synchronized == false")
        .getMany() as Array<VisitJournalEntity>;

    } catch (error) {
      throw new RepositoryError(Logging.getMessage(error, "Could not find un-synchronized visit journals"));
    }
  }

  protected getEntityName(): string {
    return "VisitJournal";
  }

  protected getIdName(): string {
    return "id";
  }
}
