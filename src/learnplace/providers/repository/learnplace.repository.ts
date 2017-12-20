import {LearnplaceEnity} from "../../entity/learnplace.enity";
import {Injectable, InjectionToken} from "@angular/core";
import {AbstractCRUDRepository, CRUDRepository} from "../../../providers/repository/repository.api";
import {Database} from "../../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../../config/typeORM-config";

/**
 * Describes a CRUD repository for {@link LearnplaceEnity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceRepository extends CRUDRepository<LearnplaceEnity, number> {}

/**
 * Uses TypeORM for CRUD operations of the {@link LearnplaceEnity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class TypeORMLearnplaceRepository extends AbstractCRUDRepository<LearnplaceEnity, number> implements LearnplaceRepository {

  constructor(database: Database) {
    super(database, PEGASUS_CONNECTION_NAME);
  }

  protected getEntityName(): string { return LearnplaceEnity.name }

  protected getIdName(): string { return "id" }
}
export const LEARNPLACE_REPOSITORY: InjectionToken<LearnplaceRepository> = new InjectionToken("token for TypeORM learnplace repository");
