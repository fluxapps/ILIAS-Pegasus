import {
  AccordionBlockModel, BlockModel, LinkBlockModel, PictureBlockModel, TextBlockModel,
  VideoBlockModel
} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {NoSuchElementError} from "../../error/errors";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {DomSanitizer} from "@angular/platform-browser";
import {AccordionEntity} from "../entity/accordion.entity";
import {TextblockEntity} from "../entity/textblock.entity";
import {PictureBlockEntity} from "../entity/pictureBlock.entity";
import {LinkblockEntity} from "../entity/linkblock.entity";
import {VideoBlockEntity} from "../entity/videoblock.entity";

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
    private readonly strategyApplier: VisibilityStrategyApplier,
    private readonly sanitizer: DomSanitizer
  ) {}

  async getBlocks(learnplaceId: number): Promise<Array<BlockModel>> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(learnplaceId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${learnplaceId}`));

    this.strategyApplier.setLearnplace(learnplaceId);

    return [
      ...this.mapTextblocks(learnplace.textBlocks),
      ...this.mapPictureBlocks(learnplace.pictureBlocks),
      ...this.mapLinkBlocks(learnplace.linkBlocks),
      ...this.mapVideoBlocks(learnplace.videoBlocks),
      ...this.mapAccordionBlock(learnplace.accordionBlocks)
    ].sort((a, b) => a.sequence - b.sequence);
  }

  private mapTextblocks(textBlocks: Array<TextblockEntity>): Array<TextBlockModel> {
    return textBlocks.map(it => {
      const model: TextBlockModel = new TextBlockModel(it.sequence, this.sanitizer.bypassSecurityTrustHtml(it.content));
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    });
  }

  private mapPictureBlocks(pictureBlocks: Array<PictureBlockEntity>): Array<PictureBlockModel> {
    return pictureBlocks.map(it => {
      const model: PictureBlockModel = new PictureBlockModel(it.sequence, it.title, it.description, it.thumbnail, it.url);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    });
  }

  private mapLinkBlocks(linkBlocks: Array<LinkblockEntity>): Array<LinkBlockModel> {

    return linkBlocks.map(it => {
      const model: LinkBlockModel = new LinkBlockModel(it.sequence, it.refId);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    })
  }

  private mapVideoBlocks(videoBlocks: Array<VideoBlockEntity>): Array<VideoBlockModel> {
    return videoBlocks.map(it => {
      const model: VideoBlockModel = new VideoBlockModel(it.sequence, it.url);
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    })
  }

  private mapAccordionBlock(accordions: Array<AccordionEntity>): Array<AccordionBlockModel> {
    return accordions.map(it => {
      const model: AccordionBlockModel = new AccordionBlockModel(
        it.sequence,
        it.title,
        it.expanded,
        [
          ...this.mapTextblocks(it.textBlocks),
          ...this.mapPictureBlocks(it.pictureBlocks),
          ...this.mapLinkBlocks(it.linkBlocks),
          ...this.mapVideoBlocks(it.videoBlocks)
        ].sort((a, b) => a.sequence - b.sequence)
      );
      this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return model;
    })
  }
}
