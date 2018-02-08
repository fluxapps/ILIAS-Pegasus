import {AbstractCRUDRepository, CRUDRepository, RepositoryError} from "./repository.api";
import {UserEntity} from "../../entity/user.entity";
import {Injectable, InjectionToken} from "@angular/core";
import {Database} from "../../services/database/database";
import {PEGASUS_CONNECTION_NAME} from "../../config/typeORM-config";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {Optional} from "../../util/util.optional";

/**
 * Provides CRUD operations to manipulate {@link UserEntity}.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export interface UserRepository extends CRUDRepository<UserEntity, number> {

  findAuthenticatedUser(): Promise<Optional<UserEntity>>;

}
export const USER_REPOSITORY: InjectionToken<UserRepository> = new InjectionToken("token for user repository");

/**
 * Provides a type ORM implementation of the user repository which provides basic CRUD functionality to manipulate the user.
 */
@Injectable()
export class UserTypeORMRepository extends AbstractCRUDRepository<UserEntity, number> implements UserRepository{

  private static readonly ENTITY_NAME: string = "users";
  private static readonly ENTITY_ID_NAME: string = "id";
  private static readonly CONNECTION_NAME: string = PEGASUS_CONNECTION_NAME;

  private readonly logger: Logger = Logging.getLogger(UserTypeORMRepository.name);

  constructor(
    database: Database
  ) {
    super(database, UserTypeORMRepository.CONNECTION_NAME);
  }

  protected getEntityName(): string {
    return UserTypeORMRepository.ENTITY_NAME;
  }

  protected getIdName(): string {
    return UserTypeORMRepository.ENTITY_ID_NAME;
  }

  async findAuthenticatedUser(): Promise<Optional<UserEntity>> {
    try {
      await this.database.ready(UserTypeORMRepository.CONNECTION_NAME);

      this.logger.trace(() => "Fetch current authenticated user.");

      const user: UserEntity|undefined = await this.connection
        .getRepository(this.getEntityName())
        .createQueryBuilder("user")
        .where("user.accessToken IS NOT NULL")
        .getOne() as UserEntity;

      return Optional.ofNullable(user);
    }
    catch (error) {
      throw new RepositoryError(Logging.getMessage(error, "Could not find active user."));
    }

  }
}
