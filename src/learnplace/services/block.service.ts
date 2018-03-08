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
import {Observable} from "rxjs/Observable";

/**
 * Describes a service that can provide all block types of a single learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
export interface BlockService {

  /**
   * Returns all block types related to the given {@code learnplaceId}.
   * The returned array is ordered by the {@link BlockModel#sequence} property.
   *
   * The returned array contains {@link Observable} for each block.
   *
   * @param {number} learnplaceId - the id of the related learnplace
   *
   * @returns {Promise<Array<Observable<BlockModel>>>} an ordered array of observables for each block type
   */
  getBlocks(learnplaceId: number): Promise<Array<Observable<BlockModel>>>
}
export const BLOCK_SERVICE: InjectionToken<BlockService> = new InjectionToken<BlockService>("token for block service");

/**
 * Manages the visibility of all blocks by using a {@link VisibilityStrategy}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class VisibilityManagedBlockService implements BlockService {

  constructor(
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly strategyApplier: VisibilityStrategyApplier,
    private readonly sanitizer: DomSanitizer
  ) {}

  /**
   * Returns an array of observables for each block of the learnplace
   * matching the given {@code learnplaceId}.
   *
   * The array is sorted by the {@code sequence} property of each block.
   *
   * @param {number} learnplaceId - object id of the learnplace
   *
   * @return {Promise<Array<Observable<BlockModel>>>} sorted array of observables of a specific block
   */
  async getBlocks(learnplaceId: number): Promise<Array<Observable<BlockModel>>> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(learnplaceId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${learnplaceId}`));

    this.strategyApplier.setLearnplace(learnplaceId);

    return [
      ...this.mapTextblocks(learnplace.textBlocks),
      ...this.mapPictureBlocks(learnplace.pictureBlocks),
      ...this.mapLinkBlocks(learnplace.linkBlocks),
      ...this.mapVideoBlocks(learnplace.videoBlocks),
      ...this.mapAccordionBlock(learnplace.accordionBlocks)
    ].sort((a, b) => a[0] - b[0])
      .map(it => it[1]);
  }

  private mapTextblocks(textBlocks: Array<TextblockEntity>): Array<[number, Observable<TextBlockModel>]> {

    return textBlocks.map<[number, Observable<TextBlockModel>]>(it => {
      const model: TextBlockModel = new TextBlockModel(it.sequence, this.sanitizer.bypassSecurityTrustHtml(it.content));
      const observable: Observable<TextBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return [it.sequence, observable];
    });
  }

  private mapPictureBlocks(pictureBlocks: Array<PictureBlockEntity>): Array<[number, Observable<PictureBlockModel>]> {
    return pictureBlocks.map<[number, Observable<PictureBlockModel>]>(it => {
      const model: PictureBlockModel = new PictureBlockModel(it.sequence, it.title, it.description, it.thumbnail, it.url);
      const observable: Observable<PictureBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return [it.sequence, observable];
    });
  }

  private mapLinkBlocks(linkBlocks: Array<LinkblockEntity>): Array<[number, Observable<LinkBlockModel>]> {

    return linkBlocks.map<[number, Observable<LinkBlockModel>]>(it => {
      const model: LinkBlockModel = new LinkBlockModel(it.sequence, it.refId);
      const observable: Observable<LinkBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return [it.sequence, observable];
    })
  }

  private mapVideoBlocks(videoBlocks: Array<VideoBlockEntity>): Array<[number, Observable<VideoBlockModel>]> {
    return videoBlocks.map<[number, Observable<VideoBlockModel>]>(it => {
      const model: VideoBlockModel = new VideoBlockModel(it.sequence, it.url);
      const observable: Observable<VideoBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return [it.sequence, observable];
    })
  }

  private mapAccordionBlock(accordions: Array<AccordionEntity>): Array<[number, Observable<AccordionBlockModel>]> {
    return accordions.map<[number, Observable<AccordionBlockModel>]>(it => {
      const model: AccordionBlockModel = new AccordionBlockModel(
        it.sequence,
        it.title,
        it.expanded,
        [
          ...this.mapTextblocks(it.textBlocks),
          ...this.mapPictureBlocks(it.pictureBlocks),
          ...this.mapLinkBlocks(it.linkBlocks),
          ...this.mapVideoBlocks(it.videoBlocks)
        ].sort((a, b) => a[0] - b[0])
          .map(it => it[1])
      );
      const observable: Observable<AccordionBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
      return [it.sequence, observable];
    })
  }
}
