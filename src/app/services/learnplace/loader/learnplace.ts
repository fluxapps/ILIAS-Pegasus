import {LEARNPLACE_API, LearnplaceAPI} from "../../../providers/learnplace/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../../providers/learnplace/repository/learnplace.repository";
import {BlockObject, JournalEntry, LearnPlace} from "../../../providers/learnplace/rest/learnplace.pojo";
import { LearnplaceEntity, LocationEntity, MapEntity, VisitJournalEntity } from "../../../entity/learnplace/learnplace.entity";
import {Logging} from "../../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityEntity} from "../../../entity/learnplace/visibility.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Optional} from "../../../util/util.optional";
import {HttpRequestError, UnfinishedHttpRequestError} from "../../../providers/http";
import {
    AccordionMapper, LinkBlockMapper, PictureBlockMapper, TextBlockMapper, VideoBlockMapper,
    VisitJournalMapper
} from "./mappers";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";
import {Observable, throwError, of, EMPTY, from, forkJoin, combineLatest} from "rxjs";
import {TextblockEntity} from "../../../entity/learnplace/textblock.entity";
import {PictureBlockEntity} from "../../../entity/learnplace/pictureBlock.entity";
import {LinkblockEntity} from "../../../entity/learnplace/linkblock.entity";
import {VideoBlockEntity} from "../../../entity/learnplace/videoblock.entity";
import {AccordionEntity} from "../../../entity/learnplace/accordion.entity";
import {isDefined} from "../../../util/util.function";
import uuid from "uuid-js";
import {mergeMap, map, mergeAll, catchError} from "rxjs/operators";

/**
 * Describes a loader for a single learnplace.
 * Loads all relevant learnplace data and stores them.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceLoader {

    /**
     * Loads all relevant data of the learnplace matching
     * the given {@code objectId} and stores them.
     *
     * @param {number} objectId - ILIAS object id of the learnplace
     *
     * @throws {LearnplaceLoadingError} if the learnplace could not be loaded
     */
    load(objectId: number): Promise<void>
}

export const LEARNPLACE_LOADER: InjectionToken<LearnplaceLoader> = new InjectionToken("token four learnplace loader");

/**
 * Loads a single learnplace over ILIAS rest and stores
 * them through {@link CRUDRepository}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.5.0
 */
@Injectable()
export class RestLearnplaceLoader implements LearnplaceLoader {

    private readonly log: Logger = Logging.getLogger(RestLearnplaceLoader.name);

    constructor(
        @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly textBlockMapper: TextBlockMapper,
        private readonly pictureBlockMapper: PictureBlockMapper,
        private readonly linkBlockMapper: LinkBlockMapper,
        private readonly videoBlockMapper: VideoBlockMapper,
        private readonly accordionMapper: AccordionMapper,
        private readonly visitJournalMapper: VisitJournalMapper
    ) {
    }

    /**
     * Loads all relevant data of the learnplace matching
     * the given {@code objectId} and stores them.
     * If the learnplace is already stored, it will be updated.
     *
     * Blocks and visit journal entries of a learnplace will be delegated to its according mapper class.
     *
     * @param {number} objectId - ILIAS object id of the learnplace
     *
     * @throws {LearnplaceLoadingError} if the learnplace could not be loaded
     */
    load(objectId: number): Promise<void> {

        const learnplace: Observable<LearnPlace> = from(this.learnplaceAPI.getLearnPlace(objectId));
        const blocks: Observable<BlockObject> = from(this.learnplaceAPI.getBlocks(objectId));
        const journalEntries: Observable<Array<JournalEntry>> = from(this.learnplaceAPI.getJournalEntries(objectId));

        const user: Observable<Optional<UserEntity>> = from(this.userRepository.findAuthenticatedUser());

        const learnplaceEntity: Observable<LearnplaceEntity> = user.pipe(
            mergeMap(it => from(this.learnplaceRepository.findByObjectIdAndUserId(objectId, it.get().id))),
            map(it => it.orElse(new LearnplaceEntity().applies(function(): void {
                this.id = uuid.create(4).toString();
            })))
        );

        const visitJournalEntities: Observable<Array<VisitJournalEntity>> = forkJoin(learnplaceEntity, journalEntries,
            (learnplaceEntity, journalEntries) => from(this.visitJournalMapper.map(learnplaceEntity.visitJournal, journalEntries))
        ).pipe(mergeAll());

        const textBlockEntities: Observable<Array<TextblockEntity>> = forkJoin(learnplaceEntity, blocks,
            (entity, blocks) => from(this.textBlockMapper.map(entity.textBlocks, blocks.text))
        ).pipe(mergeAll());

        const pictureBlockEntities: Observable<Array<PictureBlockEntity>> = forkJoin(learnplaceEntity, blocks,
            (entity, blocks) => from(this.pictureBlockMapper.map(entity.pictureBlocks, blocks.picture))
        ).pipe(mergeAll());

        const linkBlockEntities: Observable<Array<LinkblockEntity>> = forkJoin(learnplaceEntity, blocks,
            (entity, blocks) => from(this.linkBlockMapper.map(entity.linkBlocks, blocks.iliasLink))
        ).pipe(mergeAll());

        const videoBlockEntities: Observable<Array<VideoBlockEntity>> = forkJoin(learnplaceEntity, blocks,
            (entity, blocks) => from(this.videoBlockMapper.map(entity.videoBlocks, blocks.video))
        ).pipe(mergeAll());

        const accordionBlockEntities: Observable<Array<AccordionEntity>> = forkJoin(learnplaceEntity, blocks,
            (entity, blocks) => from(this.accordionMapper.map(entity.accordionBlocks, blocks.accordion))
        ).pipe(mergeAll());

        return combineLatest(
            learnplace,
            user,
            learnplaceEntity,
            visitJournalEntities,
            textBlockEntities,
            pictureBlockEntities,
            linkBlockEntities,
            videoBlockEntities,
            accordionBlockEntities,
            (learnplace, user, entity, visitJournal, textBlocks, pictureBlocks, linkBlocks, videoBlocks, accordionBlocks) =>
                entity.applies(function(): void {

                    this.objectId = learnplace.objectId;
                    this.user = Promise.resolve(user.get());

                    this.map = Optional.ofNullable(this.map).orElse(new MapEntity()).applies(function(): void {
                        this.zoom = learnplace.map.zoomLevel;
                        this.visibility = (new VisibilityEntity()).applies(function(): void {
                            this.value = learnplace.map.visibility;
                        })
                    });

                    this.location = Optional.ofNullable(this.location).orElse(new LocationEntity()).applies(function(): void {
                        this.latitude = learnplace.location.latitude;
                        this.longitude = learnplace.location.longitude;
                        this.radius = learnplace.location.radius;
                        this.elevation = learnplace.location.elevation;
                    });

                    this.visitJournal = visitJournal;
                    this.textBlocks = textBlocks;
                    this.pictureBlocks = pictureBlocks;
                    this.linkBlocks = linkBlocks;
                    this.videoBlocks = videoBlocks;
                    this.accordionBlocks = accordionBlocks;
                })
        ).pipe(
                mergeMap(it => from(this.learnplaceRepository.save(it))),
                mergeMap(_ => EMPTY), // we want to emit void, so we map the save observable to an empty one
                catchError((error, _) => {

                    if (error instanceof HttpRequestError || error instanceof UnfinishedHttpRequestError) {
                        return learnplaceEntity;
                    }

                    return throwError(error);
                }),
                mergeMap(it => {

                    if (isDefined(it.id)) {
                        return from(this.learnplaceRepository.exists(it.id));
                    }

                    return of(false);
                }),
                mergeMap(exists => {

                    if (exists) {
                        this.log.warn(() => `Learnplace with object id "${objectId}" could not be loaded, but is available from local storage`);
                        return EMPTY;
                    }

                    return throwError(new LearnplaceLoadingError(`Could not load learnplace with id "${objectId}" over http connection`));

                })
            ).toPromise();
    }
}

/**
 * Indicates, that a learnplace could not be loaded.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
export class LearnplaceLoadingError extends Error {

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, LearnplaceLoadingError.prototype);
    }
}
