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

