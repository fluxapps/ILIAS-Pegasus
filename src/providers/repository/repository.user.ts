import {AbstractCRUDRepository, CRUDRepository} from "./repository.api";
import {UserEntity} from "../../entity/user.entity";
import {Injectable, InjectionToken} from "@angular/core";

/**
 * Provides CRUD operations to manipulate {@link UserEntity}.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export interface UserRepository extends CRUDRepository<UserEntity, number> {

}
export const USER_REPOSITORY: InjectionToken<UserRepository> = new InjectionToken("token for user repository");

/**
 * Provides a type ORM implementation of the user repository which provides basic CRUD functionality to manipulate the user.
 */
@Injectable()
export class UserTypeORMRepository extends AbstractCRUDRepository<UserEntity, number> implements UserRepository{

  private static readonly ENTITY_NAME: string = "users";
  private static readonly ENTITY_ID_NAME: string = "id";

  protected getEntityName(): string {
    return UserTypeORMRepository.ENTITY_NAME;
  }

  protected getIdName(): string {
    return UserTypeORMRepository.ENTITY_ID_NAME;
  }
}
