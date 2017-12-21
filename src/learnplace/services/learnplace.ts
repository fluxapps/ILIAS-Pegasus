import {LEARNPLACE_API, LearnplaceAPI} from "../providers/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {LearnPlace} from "../providers/rest/learnplace.pojo";
import {LearnplaceEnity} from "../entity/learnplace.enity";
import {LocationEntity} from "../entity/location.entity";
import {MapEntity} from "../entity/map.entity";
import {Logging} from "../../services/logging/logging.service";
import getMessage = Logging.getMessage;
import {Inject, Injectable} from "@angular/core";
import {VisibilityEntity} from "../entity/visibility.entity";

/**
 * Describes a loader for a single learnplace.
 * Loads all relevant learnplace data and stores them.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnPlaceLoader {

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

/**
 * Loads a single learnplace over ILIAS rest and stores
 * them through {@link CRUDRepository}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class RestLearnplaceLoader implements LearnPlaceLoader {

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository
  ) {}

  async load(id: number): Promise<void> {

    try {

      const learnplace: LearnPlace = await this.learnplaceAPI.getLearnPlace(id);

      const locationEntity: LocationEntity = new LocationEntity();
      locationEntity.latitude = learnplace.location.latitude;
      locationEntity.longitude = learnplace.location.longitude;
      locationEntity.elevation = learnplace.location.elevation;
      locationEntity.radius = learnplace.location.radius;

      const visibilityEntity: VisibilityEntity = new VisibilityEntity();
      visibilityEntity.visibility = learnplace.map.visibility;

      const mapEntity: MapEntity = new MapEntity();
      mapEntity.visibility = visibilityEntity;

      const learnplaceEntity: LearnplaceEnity = new LearnplaceEnity();
      learnplaceEntity.objectId = learnplace.objectId;
      learnplaceEntity.location = locationEntity;
      learnplaceEntity.map = mapEntity;

      await this.learnplaceRepository.save(learnplaceEntity);

    } catch (error) {
      throw new InvalidLearnplaceError(getMessage(error, "Could not load learnplace"));
    }
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
