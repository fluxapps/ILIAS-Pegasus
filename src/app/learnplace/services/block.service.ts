import {
    AccordionBlockModel, BlockModel, LinkBlockModel, PictureBlockModel, TextBlockModel,
    VideoBlockModel
} from "./block.model";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {VisibilityStrategyApplier} from "./visibility/visibility.context";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {VisibilityStrategyType} from "./visibility/visibility.strategy";
import {DomSanitizer} from "@angular/platform-browser";
import {AccordionEntity} from "../entity/accordion.entity";
import {TextblockEntity} from "../entity/textblock.entity";
import {PictureBlockEntity} from "../entity/pictureBlock.entity";
import {LinkblockEntity} from "../entity/linkblock.entity";
import {VideoBlockEntity} from "../entity/videoblock.entity";
import {Observable} from "rxjs/Observable";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";

/**
 * Describes a service that can provide all block types of a single learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
export interface BlockService {

    /**
     * Returns all blocks related to the learnplace matching the given {@code learnplaceObjectId}.
     * The blocks are ordered by the {@link BlockModel#sequence} property.
     *
     * The return blocks are wrapped in an {@link Observable}. The observable never completes,
     * but can be stopped by the {@link BlockService#shutdown} method.
     *
     * The returned observable emits a new ordered array every time when a visibility of a block changes.
     *
     * @param {number} learnplaceObjectId - ILIAS object id of the laernplace
     *
     * @returns {Observable<Array<BlockModel>>} an ordered array wrapped in an observable
     *
     * @since 2.0.1
     */
    getBlockList(learnplaceObjectId: number): Observable<Array<BlockModel>>

    /**
     * Shutdown every depending or async task which can be occurred by the {@link BlockService#getBlockList} method.
     */
    shutdown(): void;
}
export const BLOCK_SERVICE: InjectionToken<BlockService> = new InjectionToken<BlockService>("token for block service");

/**
 * Manages the visibility of all blocks by using a {@link VisibilityStrategy}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @since 2.0.0
 */
@Injectable()
export class VisibilityManagedBlockService implements BlockService {

    private readonly log: Logger = Logging.getLogger(VisibilityManagedBlockService.name);

    constructor(
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly strategyApplier: VisibilityStrategyApplier,
        private readonly sanitizer: DomSanitizer
    ) {}

    /**
     * Returns all blocks related to the learnplace matching the given {@code learnplaceObjectId}.
     * The blocks are ordered by the {@link BlockModel#sequence} property.
     *
     * The return blocks are wrapped in an {@link Observable}. The observable never completes,
     * but can be stopped by the {@link BlockService#shutdown} method.
     *
     * The returned observable emits a new ordered array every time when a visibility of a block changes.
     *
     * @param {number} learnplaceObjectId - ILIAS object id of the laernplace
     *
     * @returns {Observable<Array<BlockModel>>} an ordered array wrapped in an observable
     *
     * @since 2.0.1
     */
    getBlockList(learnplaceObjectId: number): Observable<Array<BlockModel>> {

        const learnplaceEntity: Observable<LearnplaceEntity> = Observable.fromPromise(this.userRepository.findAuthenticatedUser())
            .mergeMap(user => this.learnplaceRepository.findByObjectIdAndUserId(learnplaceObjectId, user.get().id))
            .map(it => it.get())
            .do(it => this.strategyApplier.setLearnplace(it.id));

        return learnplaceEntity.mergeMap(it => {

            this.log.trace(() => `Map blocks of learnplace: id=${it.id}`);

            return Observable.combineLatest<Array<BlockModel>>(
                ...this.mapTextblocks(it.textBlocks),
                ...this.mapPictureBlocks(it.pictureBlocks),
                ...this.mapLinkBlocks(it.linkBlocks),
                ...this.mapVideoBlocks(it.videoBlocks),
                ...this.mapAccordionBlock(it.accordionBlocks)
            ).map(it => it.sort((a, b) => a.sequence - b.sequence))
        });
    }

    /**
     * Invokes {@link VisibilityStrategyApplier#shutdown} method.
     */
    shutdown(): void {
        this.strategyApplier.shutdown();
    }

    private mapTextblocks(textBlockList: Array<TextblockEntity>): Array<Observable<TextBlockModel>> {

        return textBlockList
            .map(it => {
                const model: TextBlockModel = new TextBlockModel(it.sequence, this.sanitizer.bypassSecurityTrustHtml(it.content));
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });
    }

    private mapPictureBlocks(pictureBlockList: Array<PictureBlockEntity>): Array<Observable<PictureBlockModel>> {

        return pictureBlockList
            .map(it => {
                const model: PictureBlockModel = new PictureBlockModel(it.sequence, it.title, it.description, it.thumbnail, it.url);
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });
    }

    private mapLinkBlocks(linkBlockList: Array<LinkblockEntity>): Array<Observable<LinkBlockModel>> {

        return linkBlockList
            .map(it => {
                const model: LinkBlockModel = new LinkBlockModel(it.sequence, it.refId);
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });
    }

    private mapVideoBlocks(videoBlockList: Array<VideoBlockEntity>): Array<Observable<VideoBlockModel>> {

        return videoBlockList
            .map(it => {
                const model: VideoBlockModel = new VideoBlockModel(it.sequence, it.url);
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });
    }

    private mapAccordionBlock(accordionBlockList: Array<AccordionEntity>): Array<Observable<AccordionBlockModel>> {

        return accordionBlockList
            .map(accordion => {

                const blockList: Observable<Array<BlockModel>> = Observable.combineLatest<Array<BlockModel>>(
                    ...this.mapTextblocks(accordion.textBlocks),
                    ...this.mapPictureBlocks(accordion.pictureBlocks),
                    ...this.mapLinkBlocks(accordion.linkBlocks),
                    ...this.mapVideoBlocks(accordion.videoBlocks)
                ).map(it => it.sort((a, b) => a.sequence - b.sequence));

                const model: AccordionBlockModel = new AccordionBlockModel(
                    accordion.sequence,
                    accordion.title,
                    accordion.expanded,
                    blockList
                );

                return this.strategyApplier.apply(model, VisibilityStrategyType[accordion.visibility.value]);
            })
    }
}
