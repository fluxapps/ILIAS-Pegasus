import {MapModel} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityContext, VisibilityContextFactory} from "./visibility/visibility.context";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {LearnplaceEnity} from "../entity/learnplace.enity";

/**
 * Describes a service to operate with Maps.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MapService {

  /**
   * Creates a map by the given {@code learnplaceId}.
   *
   * @param {number} learnplaceId - the id of the learnplace to find the according map
   *
   * @returns {Promise<MapModel>} the resulting model
   */
  getMap(learnplaceId: number): Promise<MapModel>
}
export const MAP_SERVICE: InjectionToken<MapService> = new InjectionToken("token for map service");

/**
 * Manages the visibility of a map by using the {@link VisibilityContext}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class VisibilityManagedMapService implements MapService {

  constructor(
    private readonly visibilityContextFactory: VisibilityContextFactory,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository
  ) {}

  /**
   * Creates a map by the given {@code learnplaceId}.
   *
   * The returned maps visibility is managed by the {@link VisibilityContext}.
   *
   * @param {number} learnplaceId - the id of the learnplace to find the according map
   *
   * @returns {Promise<MapModel>} the resulting model
   * @throws {NoSuchElementError} if no learnplace matches the given id
   */
  async getMap(learnplaceId: number): Promise<MapModel> {

    const learnplace: LearnplaceEnity = (await this.learnplaceRepository.find(learnplaceId)).get();

    const map: MapModel = new MapModel(
      "title", // TODO: what title do we want
      learnplace.location.latitude,
      learnplace.location.longitude
    );

    const visibilityType: VisibilityStrategyType = VisibilityStrategyType[learnplace.map.visibility.value]
    const visibilityContext: VisibilityContext = this.visibilityContextFactory.create(visibilityType);
    visibilityContext.use(map);

    return map;
  }
}
