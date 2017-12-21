import {Connection, getConnection} from "typeorm";
import {DEFAULT_CONNECTION_NAME} from "../../services/database/database.api";
import {Database} from "../../services/database/database";

/**
 * Describes a repository with basic CRUD operations.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface CRUDRepository<T, K> {

  /**
   * Saves the given {@code entity} and returns the stored entity.
   * Property changes during the save process are updated in the returned entity. e.g. primary key generation
   *
   * @param {T} entity - the entity to save
   *
   * @returns {Promise<T>} - the resulting entity
   */
  save(entity: T): Promise<T>

  /**
   * Searches an entity matching the given {@code primaryKey}.
   *
   * @param {K} primaryKey - primary key to search
   *
   * @returns {Promise<T>} - the resulting entity
   */
  find(primaryKey: K): Promise<T>

  /**
   * Deletes the given {@code entity}.
   *
   * @param {T} entity - the entity to delete
   */
  delete(entity: T): Promise<void>
}

/**
 * Generic implementation of a {@link CRUDRepository}.
 * Extend this class to have an implementation for the CRUD repository
 * on your specific repository.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export abstract class AbstractCRUDRepository<T, K> implements CRUDRepository<T, K> {

  protected connection: Connection;

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
   */
  async save(entity: T): Promise<T> {

    await this.database.ready(this.connectionName);

    return getConnection(this.connectionName)
      .getRepository(this.getEntityName)
      .save(entity);
  }

  /**
   * Searches an entity matching the given {@code primaryKey}.
   *
   * The entity will be found by TypeORM.
   *
   * @param {K} primaryKey - primary key to search
   *
   * @returns {Promise<T>} - the resulting entity
   */
  async find(primaryKey: K): Promise<T> {

    await this.database.ready(this.connectionName);

    // await is needed here, so we can cast it to T
    return await getConnection(this.connectionName)
      .getRepository(this.getEntityName)
      .findOneById(primaryKey) as T;
  }

  /**
   * Deletes the given {@code entity} by searching for the database entry with the same id.
   *
   * The entity will be deleted by TypeORM.
   *
   * @param {T} entity - the entity to delete
   */
  async delete(entity: T): Promise<void> {

    await this.database.ready(this.connectionName);

    await getConnection(this.connectionName)
      .getRepository(this.getEntityName)
      .deleteById(entity[this.getIdName()]);
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
