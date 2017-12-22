import {MapModel} from "../page.model";

/**
 * Describes a service to operate with Maps.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export interface MapService {

  /**
   * Creates a map by the given {@code learnplaceId}.
   *
   * @param {number} learnplaceId - the id of the learnplace to find the according map
   *
   * @returns {MapModel} the resulting model
   */
  getMap(learnplaceId: number): MapModel
}

/**
 * Manages the visibility of a map by using the {@link VisibilityContext}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class VisibilityManagedMapService implements MapService {

  getMap(learnplaceId: number): MapModel {
    throw new Error("This method is not implemented yet");
  }
}
