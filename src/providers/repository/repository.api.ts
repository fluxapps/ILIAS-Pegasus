import {Connection, FindManyOptions, getConnection} from "typeorm";
import {DEFAULT_CONNECTION_NAME} from "../../services/database/database.api";
import {Database} from "../../services/database/database";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {Optional} from "../../util/util.optional";

/**
 * Describes a repository with basic CRUD operations.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.1.0
 */
export interface CRUDRepository<T, K> {

  /**
   * Saves the given {@code entity} and returns the stored entity.
   * Property changes during the save process are updated in the returned entity. e.g. primary key generation
   *
   * @param {T} entity - the entity to save
   *
   * @returns {Promise<T>} - the resulting entity
   * @throws {RepositoryError} if an error occurs during this operation
   */
  save(entity: T): Promise<T>

  /**
   * Searches an entity matching the given {@code primaryKey}.
   *
   * @param {K} primaryKey - primary key to search
   *
   * @returns {Promise<Optional<T>>} - an Optional of the resulting entity
   * @throws {RepositoryError} if an error occurs during this operation
   */
  find(primaryKey: K): Promise<Optional<T>>

  /**
   * Deletes the given {@code entity}.
   *
   * @param {T} entity - the entity to delete
   *
   * @throws {RepositoryError} if an error occurs during this operation
   */
  delete(entity: T): Promise<void>

  /**
   * Returns true if an entity matching the given {@code primaryKey} exists,
   * otherwise false.
   *
   * @param {K} primaryKey - primary key to check
   *
   * @returns {Promise<boolean>} true if it exists, otherwise false
   */
  exists(primaryKey: K): Promise<boolean>
}

/**
 * Generic implementation of a {@link CRUDRepository}.
 * Extend this class to have an implementation for the CRUD repository
 * on your specific repository.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.1.0
 */
export abstract class AbstractCRUDRepository<T, K> implements CRUDRepository<T, K> {

  protected connection: Connection;

  private readonly log: Logger = Logging.getLogger(AbstractCRUDRepository.name);

  constructor(
    protected readonly database: Database,
    private readonly connectionName: string = DEFAULT_CONNECTION_NAME
  ) {
    this.connection = getConnection(connectionName);
  }

  /**
   * Saves the given {@code entity} and returns the stored entity.
   * Property changes during the save process are updated in the returned entity. e.g. primary key generation
   *
   * The entity will be saved by TypeORM.
   *
   * @param {T} entity - the entity to save
   *
   * @returns {Promise<T>} - the resulting entity
   * @throws {RepositoryError} if an error occurs during this operation
   */
  async save(entity: T): Promise<T> {

    try {

      await this.database.ready(this.connectionName);

      this.log.info(() => `Save entity "${this.getEntityName()}"`);

      return this.connection
        .getRepository(this.getEntityName())
        .save(entity);

    } catch (error) {
      throw new RepositoryError(Logging.getMessage(error, `Could not save entity "${this.getEntityName()}"`));
    }
  }

  /**
   * Searches an entity matching the given {@code primaryKey}.
   *
   * The entity will be found by TypeORM.
   *
   * @param {K} primaryKey - primary key to search
   *
   * @returns {Promise<Optional<T>>} - an Optional of the resulting entity
   * @throws {RepositoryError} if an error occurs during this operation
   */
  async find(primaryKey: K): Promise<Optional<T>> {

    try {

      await this.database.ready(this.connectionName);

      this.log.info(() => `Find entity "${this.getEntityName()}" by id "${primaryKey}"`);

      const result: T = await this.connection
        .getRepository(this.getEntityName())
        .findOneById(primaryKey) as T;

      return Optional.ofNullable(result);

    } catch (error) {
      throw new RepositoryError(Logging.getMessage(error, `Could not find entity "${this.getEntityName()}" by id "${primaryKey}"`));
    }
  }

  /**
   * Deletes the given {@code entity} by searching for the database entry with the same id.
   *
   * The entity will be deleted by TypeORM.
   *
   * @param {T} entity - the entity to delete
   *
   * @throws {RepositoryError} if an error occurs during this operation
   */
  async delete(entity: T): Promise<void> {

    try {

      await this.database.ready(this.connectionName);

      this.log.info(() => `Delete entity "${this.getEntityName()}"`);

      await this.connection
        .getRepository(this.getEntityName())
        .deleteById(entity[this.getIdName()]);
    } catch (error) {
      throw new RepositoryError(Logging.getMessage(error, `Could not delete entity "${this.getEntityName()}"`));
    }
  }

  /**
   * Returns true if an entity matching the given {@code primaryKey} exists,
   * otherwise false.
   *
   * Uses the {@link AbstractCRUDRepository#find} method to check the existence of the entity.
   *
   * @param {K} primaryKey - primary key to check
   *
   * @returns {Promise<boolean>} true if it exists, otherwise false
   */
  async exists(primaryKey: K): Promise<boolean> {
      return (await this.find(primaryKey)).isPresent();
  }

  /**
   * @returns {string} the name of the entity used
   */
  protected abstract getEntityName(): string

  /**
   * @returns {string} the name of the id property of the entity used
   */
  protected abstract getIdName(): string
}

/**
 * Indicates an error during a repository operation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class RepositoryError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RepositoryError.prototype);
  }
}
