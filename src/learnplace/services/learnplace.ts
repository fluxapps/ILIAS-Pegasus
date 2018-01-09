import {LEARNPLACE_API, LearnplaceAPI} from "../providers/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {LearnPlace} from "../providers/rest/learnplace.pojo";
import {LearnplaceEnity} from "../entity/learnplace.enity";
import {LocationEntity} from "../entity/location.entity";
import {MapEntity} from "../entity/map.entity";
import {Logging} from "../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityEntity} from "../entity/visibility.entity";
import {Logger} from "../../services/logging/logging.api";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {Optional} from "../../util/util.optional";

/**
 * A readonly instance of the currently opened learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceData {

  /**
   * @returns {number} - the id of the opened learnplace
   * @throws {InvalidLearnplaceError} if this object is in a unusable state
   */
  getId(): number

  /**
   * @returns {string} - the name of the opened learnplace
   * @throws {InvalidLearnplaceError} if this object is in a unusable state
   */
  getName(): string
}
export const LEARNPLACE: InjectionToken<LearnplaceData> = new InjectionToken("token for a learnplace");

/**
 * A mutable instance of the currently opened learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MutableLearnplaceData extends LearnplaceData {

  /**
   * Sets the id of the learnplace.
   *
   * @param {number} id - the id of the learnplace
   */
  setId(id: number): void

  /**
   * Sets the name of the learnplace.
   *
   * @param {string} name - the name of the learnplace
   */
  setName(name: string): void
}
export const MUT_LEARNPLACE: InjectionToken<MutableLearnplaceData> = new InjectionToken("token for a mutable learnplace");

/**
 * Holds information about the currently opened learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
@Injectable()
export class LearnplaceObject implements MutableLearnplaceData {

  private id: number | undefined = undefined;
  private name: string | undefined =undefined;

  getId(): number {
    if (isUndefined(this.id)) {
      throw new InvalidLearnplaceError("Learnplace is not setup: id was never assigned");
    }
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }


  getName(): string {
    if (isUndefined(this.name)) {
      throw new InvalidLearnplaceError("Learnplace is not setup: name was never assigned");
    }
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }
}

/**
 * Describes a loader for a single learnplace.
 * Loads all relevant learnplace data and stores them.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceLoader {

  /**
   * Loads all relevant data of the learnplace matching
   * the given {@code id} and stores them.
   *
   * @param {number} id - the id to use
   *
   * @throws {InvalidLearnplaceError} if the learnplace could not be loaded
   */
  load(id: number): Promise<void>
}
export const LEARNPLACE_LOADER: InjectionToken<LearnplaceLoader> = new InjectionToken("token four learnplace loader");

/**
 * Loads a single learnplace over ILIAS rest and stores
 * them through {@link CRUDRepository}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class RestLearnplaceLoader implements LearnplaceLoader {

  private readonly log: Logger = Logging.getLogger(RestLearnplaceLoader.name);

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository
  ) {}

  /**
   * Loads all relevant data of the learnplace matching
   * the given {@code id} and stores them.
   * If the learnplace is already stored, it will be updated.
   *
   * @param {number} id - the id to use
   *
   * @throws {InvalidLearnplaceError} if the learnplace could not be loaded
   */
  async load(id: number): Promise<void> {

    try {

      this.log.info(() => `Load learnplace with id: ${id}`);

      const learnplace: LearnplaceEnity = await this.getLearnplace(id);

      await this.learnplaceRepository.save(learnplace);

    } catch (error) {
      throw new InvalidLearnplaceError(Logging.getMessage(error, "Could not load learnplace"));
    }
  }

  /**
   * Gets the learnplace entity matching the given {@code id}.
   *
   * If the learnplace is already stored, it will be updated with the learnplace data from the {@link LearnplaceAPI} and then returned.
   *
   * If the learnplace is new, it will be created and filled with the learnplace data from the {@link LearnplaceAPI} and then returned.
   *
   * @param {number} id - the id to use
   *
   * @returns {Promise<LearnplaceEnity>} the resulting entity
   */
  private async getLearnplace(id: number): Promise<LearnplaceEnity> {

    const learnplace: LearnPlace = await this.learnplaceAPI.getLearnPlace(id);

    const learnplaceOptional: Optional<LearnplaceEnity> = await this.learnplaceRepository.find(id);

    if (learnplaceOptional.isPresent()) {
      return this.fillEntity(learnplaceOptional.get(), learnplace);
    }
    return this.createLearnplace(learnplace);
  }

  /**
   * Fills the given {@code entity} with the data of the given {@code source}, assuming there are non-null / non-undefined values.
   * This method does not modify any ids of the given {@code entity} and its relations.
   *
   * @param {LearnplaceEnity} entity - the entity to fill in the data
   * @param {LearnPlace} source - the source data to fill into the entity
   *
   * @returns {LearnplaceEnity} - the given entity with the filled data
   */
  private fillEntity(entity: LearnplaceEnity, source: LearnPlace): LearnplaceEnity {

    entity.map.visibility.value = source.map.visibility;
    entity.location.latitude = source.location.latitude;
    entity.location.longitude = source.location.longitude;
    entity.location.radius = source.location.radius;
    entity.location.elevation = source.location.elevation;

    return entity;
  }

  /**
   * Creates a {@link LearnplaceEnity} and ensures that there are only non-null / non-undefined values,
   * in order to use the {@link fillEntity} method.
   *
   * @param {LearnPlace} learnplace - the learnplace data to use
   *
   * @returns {LearnplaceEnity} the new learnplace entity filled with the data of the learnplace
   */
  private createLearnplace(learnplace: LearnPlace): LearnplaceEnity {
    const learnplaceEntity: LearnplaceEnity = new LearnplaceEnity();

    learnplaceEntity.objectId = learnplace.objectId;
    learnplaceEntity.location = new LocationEntity();
    learnplaceEntity.map = new MapEntity();
    learnplaceEntity.map.visibility = new VisibilityEntity();

    this.fillEntity(learnplaceEntity, learnplace);

    return learnplaceEntity;
  }
}

/**
 * Indicates a invalid state when handling a learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class InvalidLearnplaceError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidLearnplaceError.prototype);
  }
}
