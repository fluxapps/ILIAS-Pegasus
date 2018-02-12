import {BlockModel, PictureBlockModel, TextBlockModel, VideoBlockModel} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {VisibilityContext, VisibilityContextFactory} from "./visibility/visibility.context";
import {LearnplaceEntity} from "../entity/learnplace.entity";
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
 * @version 0.0.4
 */
@Injectable()
export class VisibilityManagedBlockService implements BlockService {

  constructor(
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly contextFactory: VisibilityContextFactory
  ) {}

  async getBlocks(learnplaceId: number): Promise<Array<BlockModel>> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(learnplaceId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${learnplaceId}`));

    return [
      ...this.mapTextblocks(learnplace),
      ...this.mapPictureBlocks(learnplace),
      ...this.mapVideoBlocks(learnplace)
    ].sort((a, b) => a.sequence - b.sequence);
  }

  private mapTextblocks(learnplace: LearnplaceEntity): Array<BlockModel> {
    return learnplace.textBlocks.map(block => {
      const model: TextBlockModel = new TextBlockModel(block.sequence, block.content);
      this.contextFactory.create(VisibilityStrategyType[block.visibility.value]).use(model);
      return model;
    });
  }

  private mapPictureBlocks(learnplace: LearnplaceEntity): Array<BlockModel> {
    return learnplace.pictureBlocks.map(block => {
      const model: PictureBlockModel = new PictureBlockModel(block.sequence, block.title, block.description, block.thumbnail, block.url);
      this.contextFactory.create(VisibilityStrategyType[block.visibility.value]).use(model);
      return model;
    });
  }

  private mapVideoBlocks(learnplace: LearnplaceEntity): Array<BlockModel> {
    return learnplace.videoBlocks.map(block => {
      const model: VideoBlockModel = new VideoBlockModel(block.sequence, block.url);
      this.contextFactory.create(VisibilityStrategyType[block.visibility.value]).use(model);
      return model;
    })
  }
}
