import {BlockModel, TextBlockModel} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {VisibilityContext, VisibilityContextFactory} from "./visibility/visibility.context";
import {LearnplaceEnity} from "../entity/learnplace.enity";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {NoSuchElementError} from "../../error/errors";

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
export const BLOCK_SERVICE: InjectionToken<BlockService> = new InjectionToken<BlockService>("token for block service");

/**
 * Manages the visibility of all blocks by using the {@link VisibilityContext}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.2
 */
@Injectable()
export class VisibilityManagedBlockService implements BlockService {

  constructor(
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly contextFactory: VisibilityContextFactory
  ) {}

  async getBlocks(learnplaceId: number): Promise<Array<BlockModel>> {

    const learnplace: LearnplaceEnity = (await this.learnplaceRepository.find(learnplaceId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${learnplaceId}`));

    return learnplace.textBlocks.map(block => {

      const model: TextBlockModel = new TextBlockModel(block.sequence, block.content);

      const visibilityContext: VisibilityContext = this.contextFactory.create(VisibilityStrategyType[block.visibility.value]);

      visibilityContext.use(model);

      return model;

    }).sort((a, b) => a.sequence - b.sequence);
  }
}
