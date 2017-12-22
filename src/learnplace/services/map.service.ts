import {MapModel} from "../page.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityContextFactory} from "./visibility/visibility.context";
import {MAP_REPOSITORY, MapRepository} from "../providers/repository/map.repository";

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
 * @version 0.0.1
 */
@Injectable()
export class VisibilityManagedMapService implements MapService {

  constructor(
    private readonly visibilityContextFactory: VisibilityContextFactory,
    @Inject(MAP_REPOSITORY) private readonly mapRepository: MapRepository
  ) {}

  getMap(learnplaceId: number): Promise<MapModel> {
    throw new Error("This method is not implemented yet");
  }
}
