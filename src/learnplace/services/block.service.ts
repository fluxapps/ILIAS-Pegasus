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

/**
 * Describes a service that can provide all block types of a single learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
export interface BlockService {

    /**
     * Returns all block types related to the given {@code learnplaceObjectId}.
     * The returned array is ordered by the {@link BlockModel#sequence} property.
     *
     * The returned array contains {@link Observable} for each block.
     *
     * @param {number} learnplaceObjectId - ILIAS object id
     *
     * @returns {Promise<Array<Observable<BlockModel>>>} an ordered array of observables for each block type
     */
    getBlocks(learnplaceObjectId: number): Promise<Array<Observable<BlockModel>>>

    /**
     * Shutdown every depending or async task which can be occurred by the {@link BlockService#getBlocks} method.
     */
    shutdown(): void;
}
export const BLOCK_SERVICE: InjectionToken<BlockService> = new InjectionToken<BlockService>("token for block service");

/**
 * Manages the visibility of all blocks by using a {@link VisibilityStrategy}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.1
 */
@Injectable()
export class VisibilityManagedBlockService implements BlockService {

    constructor(
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly strategyApplier: VisibilityStrategyApplier,
        private readonly sanitizer: DomSanitizer
    ) {}

    /**
     * Returns an array of observables for each block of the learnplace
     * matching the given {@code learnplaceObjectId}.
     *
     * The array is sorted by the {@code sequence} property of each block.
     *
     * @param {number} learnplaceObjectId - ILIAS object id of the learnplace
     *
     * @return {Promise<Array<Observable<BlockModel>>>} sorted array of observables of a specific block
     */
    async getBlocks(learnplaceObjectId: number): Promise<Array<Observable<BlockModel>>> {

        const learnplaceEntity: Observable<LearnplaceEntity> = Observable.fromPromise(this.userRepository.findAuthenticatedUser())
            .mergeMap(user => this.learnplaceRepository.findByObjectIdAndUserId(learnplaceObjectId, user.get().id))
            .map(it => it.get())
            .do(it => this.strategyApplier.setLearnplace(it.id));

        return Observable.merge(
            this.mapTextblocks(learnplaceEntity.mergeMap(it => Observable.of(...it.textBlocks))),
            this.mapPictureBlocks(learnplaceEntity.mergeMap(it => Observable.of(...it.pictureBlocks))),
            this.mapLinkBlocks(learnplaceEntity.mergeMap(it => Observable.of(...it.linkBlocks))),
            this.mapVideoBlocks(learnplaceEntity.mergeMap(it => Observable.of(...it.videoBlocks))),
            this.mapAccordionBlock(learnplaceEntity.mergeMap(it => Observable.of(...it.accordionBlocks)))
        ).toArray().toPromise();



        // return [
        //     ...this.mapTextblocks(learnplace.textBlocks),
        //     ...this.mapPictureBlocks(learnplace.pictureBlocks),
        //     ...this.mapLinkBlocks(learnplace.linkBlocks),
        //     ...this.mapVideoBlocks(learnplace.videoBlocks),
        //     ...this.mapAccordionBlock(learnplace.accordionBlocks)
        // ].sort((a, b) => a[0] - b[0])
        //     .map(it => it[1]);
    }

    /**
     * Invokes {@link VisibilityStrategyApplier#shutdown} method.
     */
    shutdown(): void {
        this.strategyApplier.shutdown();
    }

    private mapTextblocks(textBlocks: Observable<TextblockEntity>): Observable<Observable<TextBlockModel>> {

        return textBlocks
            .map(it => {
                const model: TextBlockModel = new TextBlockModel(it.sequence, this.sanitizer.bypassSecurityTrustHtml(it.content));
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });

        //
        //
        // return textBlocks.map<[number, Observable<TextBlockModel>]>(it => {
        //     const model: TextBlockModel = new TextBlockModel(it.sequence, this.sanitizer.bypassSecurityTrustHtml(it.content));
        //     const observable: Observable<TextBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
        //     return [it.sequence, observable];
        // });
    }

    private mapPictureBlocks(pictureBlocks: Observable<PictureBlockEntity>): Observable<Observable<PictureBlockModel>> {

        return pictureBlocks
            .map(it => {
                const model: PictureBlockModel = new PictureBlockModel(it.sequence, it.title, it.description, it.thumbnail, it.url);
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });


        // return pictureBlocks.map<[number, Observable<PictureBlockModel>]>(it => {
        //     const model: PictureBlockModel = new PictureBlockModel(it.sequence, it.title, it.description, it.thumbnail, it.url);
        //     const observable: Observable<PictureBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
        //     return [it.sequence, observable];
        // });
    }

    private mapLinkBlocks(linkBlocks: Observable<LinkblockEntity>): Observable<Observable<LinkBlockModel>> {

        return linkBlocks
            .map(it => {
                const model: LinkBlockModel = new LinkBlockModel(it.sequence, it.refId);
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });


        // return linkBlocks.map<[number, Observable<LinkBlockModel>]>(it => {
        //     const model: LinkBlockModel = new LinkBlockModel(it.sequence, it.refId);
        //     const observable: Observable<LinkBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
        //     return [it.sequence, observable];
        // })
    }

    private mapVideoBlocks(videoBlocks: Observable<VideoBlockEntity>): Observable<Observable<VideoBlockModel>> {

        return videoBlocks
            .map(it => {
                const model: VideoBlockModel = new VideoBlockModel(it.sequence, it.url);
                return this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
            });


        // return videoBlocks.map<[number, Observable<VideoBlockModel>]>(it => {
        //     const model: VideoBlockModel = new VideoBlockModel(it.sequence, it.url);
        //     const observable: Observable<VideoBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
        //     return [it.sequence, observable];
        // })
    }

    private mapAccordionBlock(accordionBlocks: Observable<AccordionEntity>): Observable<Observable<AccordionBlockModel>> {

        const blockLists: Observable<Array<Observable<BlockModel>>> = accordionBlocks.mergeMap(it => Observable.merge(
                this.mapTextblocks(Observable.of(...it.textBlocks)),
                this.mapPictureBlocks(Observable.of(...it.pictureBlocks)),
                this.mapLinkBlocks(Observable.of(...it.linkBlocks)),
                this.mapVideoBlocks(Observable.of(...it.videoBlocks))
            ).toArray<Observable<BlockModel>>()
        );

        return Observable.forkJoin(blockLists, accordionBlocks, (blockList, accordion) => {

            const model: AccordionBlockModel = new AccordionBlockModel(
                accordion.sequence,
                accordion.title,
                accordion.expanded,
                blockList
            );

            return this.strategyApplier.apply(model, VisibilityStrategyType[accordion.visibility.value]);
        });

        // return accordions.map<[number, Observable<AccordionBlockModel>]>(it => {
        //     const model: AccordionBlockModel = new AccordionBlockModel(
        //         it.sequence,
        //         it.title,
        //         it.expanded,
        //         [
        //             ...this.mapTextblocks(it.textBlocks),
        //             ...this.mapPictureBlocks(it.pictureBlocks),
        //             ...this.mapLinkBlocks(it.linkBlocks),
        //             ...this.mapVideoBlocks(it.videoBlocks)
        //         ].sort((a, b) => a[0] - b[0])
        //             .map(it => it[1])
        //     );
        //     const observable: Observable<AccordionBlockModel> = this.strategyApplier.apply(model, VisibilityStrategyType[it.visibility.value]);
        //     return [it.sequence, observable];
        // })
    }
}
