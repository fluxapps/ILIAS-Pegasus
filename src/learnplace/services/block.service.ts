import {BlockModel, TextBlockModel} from "../page.model";
import {InjectionToken} from "@angular/core";
import {LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {VisibilityContextFactory} from "./visibility/visibility.context";

/**
 * Describes a service that can provide all block types of a single learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface BlockService {

  /**
   * Returns all block types related to the given {@code learnplaceId}.
   * The returned array is ordered by the {@link BlockModel#sequence} property.
   *
   * @param {number} learnplaceId - the id of the related learnplace
   *
   * @returns {Promise<Array<TextBlockModel>>} an ordered array of all block types
   */
  getBlocks(learnplaceId: number): Promise<Array<BlockModel>>
}
const BLOCK_SERVICE: InjectionToken<BlockService> = new InjectionToken<BlockService>("token for block service");

/**
 * Manages the visibility of all blocks by using the {@link VisibilityContext}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class VisibilityManagedBlockService implements BlockService {

  constructor(
    private readonly learnplaceRepository: LearnplaceRepository,
    private readonly contextFactory: VisibilityContextFactory
  ) {}

  async getBlocks(learnplaceId: number): Promise<Array<BlockModel>> {
    throw new Error("This method is not implemented yet");
  }
}
