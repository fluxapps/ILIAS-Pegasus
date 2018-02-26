import {BlockModel, LinkBlockModel, PictureBlockModel, TextBlockModel, VideoBlockModel} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {NoSuchElementError} from "../../error/errors";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";

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
 * Manages the visibility of all blocks by using a {@link VisibilityStrategy}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.5
 */
@Injectable()
export class VisibilityManagedBlockService implements BlockService {

  constructor(
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly strategyApplier: VisibilityStrategyApplier
  ) {}

  async getBlocks(learnplaceId: number): Promise<Array<BlockModel>> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(learnplaceId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${learnplaceId}`));

    this.strategyApplier.setLearplace(learnplaceId);

    return [
      ...this.mapTextblocks(learnplace),
      ...this.mapPictureBlocks(learnplace),
      ...this.mapLinkBlocks(learnplace),
      ...this.mapVideoBlocks(learnplace)
    ].sort((a, b) => a.sequence - b.sequence);
  }

  private mapTextblocks(learnplace: LearnplaceEntity): Array<BlockModel> {
    return learnplace.textBlocks.map(it => {
      const model: TextBlockModel = new TextBlockModel(it.sequence, it.content);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    });
  }

  private mapPictureBlocks(learnplace: LearnplaceEntity): Array<BlockModel> {
    return learnplace.pictureBlocks.map(it => {
      const model: PictureBlockModel = new PictureBlockModel(it.sequence, it.title, it.description, it.thumbnail, it.url);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    });
  }

  private mapLinkBlocks(learnplace: LearnplaceEntity): Array<LinkBlockModel> {
    return learnplace.linkBlocks.map(it => {
      const model: LinkBlockModel = new LinkBlockModel(it.sequence, it.refId);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    })
  }

  private mapVideoBlocks(learnplace: LearnplaceEntity): Array<BlockModel> {
    return learnplace.videoBlocks.map(it => {
      const model: VideoBlockModel = new VideoBlockModel(it.sequence, it.url);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    })
  }
}
