import {CRUDRepository} from "./repository.api";
import {LearnplaceEnity} from "../../entity/learnplace.enity";
import {Injectable, InjectionToken} from "@angular/core";

/**
 * Describes a CRUD repository for {@link LearnplaceEnity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceRepository extends CRUDRepository<LearnplaceEnity, number> {}
const LEARNPLACE_REPOSITORY: InjectionToken<LearnplaceRepository> = new InjectionToken("token for learnplace repository");

/**
 * Uses TypeORM for CRUD operations of the {@link LearnplaceEnity}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class TypeORMLearnplaceRepository implements LearnplaceRepository {

  save(entity: LearnplaceEnity): Promise<LearnplaceEnity> {
    throw new Error("This method is not implemented yet");
  }

  find(primaryKey: number): Promise<LearnplaceEnity> {
    throw new Error("This method is not implemented yet");
  }

  delete(entity: LearnplaceEnity): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}
