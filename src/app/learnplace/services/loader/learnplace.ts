import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {BlockObject, JournalEntry, LearnPlace} from "../../providers/rest/learnplace.pojo";
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {LocationEntity} from "../../entity/location.entity";
import {MapEntity} from "../../entity/map.entity";
import {Logging} from "../../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityEntity} from "../../entity/visibility.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Optional} from "../../../util/util.optional";
import {HttpRequestError, UnfinishedHttpRequestError} from "../../../providers/http";
import {
    AccordionMapper, LinkBlockMapper, PictureBlockMapper, TextBlockMapper, VideoBlockMapper,
    VisitJournalMapper
} from "./mappers";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";
import {Observable} from "rxjs/Observable";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
import {TextblockEntity} from "../../entity/textblock.entity";
import {PictureBlockEntity} from "../../entity/pictureBlock.entity";
import {LinkblockEntity} from "../../entity/linkblock.entity";
import {VideoBlockEntity} from "../../entity/videoblock.entity";
import {AccordionEntity} from "../../entity/accordion.entity";
import {isDefined} from "../../../util/util.function";
import {UniqueDeviceID} from "@ionic-native/unique-device-id/ngx";

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
        private readonly visitJournalMapper: VisitJournalMapper,
        private readonly uuid: UniqueDeviceID
    ) {}

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

        const learnplace: Observable<LearnPlace> = Observable.fromPromise(this.learnplaceAPI.getLearnPlace(objectId));
        const blocks: Observable<BlockObject> = Observable.fromPromise(this.learnplaceAPI.getBlocks(objectId));
        const journalEntries: Observable<Array<JournalEntry>> = Observable.fromPromise(this.learnplaceAPI.getJournalEntries(objectId));

        const user: Observable<Optional<UserEntity>> = Observable.fromPromise(this.userRepository.findAuthenticatedUser());

        return this.uuid.get().then((id: string) => {
            const learnplaceEntity: Observable<LearnplaceEntity> = user
                .mergeMap(it => Observable.fromPromise(this.learnplaceRepository.findByObjectIdAndUserId(objectId, it.get().id)))
                .map(it => it.orElse(new LearnplaceEntity().applies(function(): void {
                    this.id = id;
                })));

            const visitJournalEntities: Observable<Array<VisitJournalEntity>> = Observable.forkJoin(learnplaceEntity, journalEntries,
                (learnplaceEntity, journalEntries) => Observable.fromPromise(this.visitJournalMapper.map(learnplaceEntity.visitJournal, journalEntries))
            ).mergeAll();

            const textBlockEntities: Observable<Array<TextblockEntity>> = Observable.forkJoin(learnplaceEntity, blocks,
                (entity, blocks) => Observable.fromPromise(this.textBlockMapper.map(entity.textBlocks, blocks.text))
            ).mergeAll();

            const pictureBlockEntities: Observable<Array<PictureBlockEntity>> = Observable.forkJoin(learnplaceEntity, blocks,
                (entity, blocks) => Observable.fromPromise(this.pictureBlockMapper.map(entity.pictureBlocks, blocks.picture))
            ).mergeAll();

            const linkBlockEntities: Observable<Array<LinkblockEntity>> = Observable.forkJoin(learnplaceEntity, blocks,
                (entity, blocks) => Observable.fromPromise(this.linkBlockMapper.map(entity.linkBlocks, blocks.iliasLink))
            ).mergeAll();

            const videoBlockEntities: Observable<Array<VideoBlockEntity>> = Observable.forkJoin(learnplaceEntity, blocks,
                (entity, blocks) => Observable.fromPromise(this.videoBlockMapper.map(entity.videoBlocks, blocks.video))
            ).mergeAll();

            const accordionBlockEntities: Observable<Array<AccordionEntity>> = Observable.forkJoin(learnplaceEntity, blocks,
                (entity, blocks) => Observable.fromPromise(this.accordionMapper.map(entity.accordionBlocks, blocks.accordion))
            ).mergeAll();

            return Observable.combineLatest(
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
            ).mergeMap(it => Observable.fromPromise(this.learnplaceRepository.save(it)))
                .mergeMap(_ => Observable.empty()) // we want to emit void, so we map the save observable to an empty one
                .catch((error, _) => {

                    if (error instanceof HttpRequestError || error instanceof UnfinishedHttpRequestError) {
                        return learnplaceEntity;
                    }

                    return Observable.throw(error)
                }).mergeMap(it => {

                    if(isDefined(it.id)) {
                        return Observable.fromPromise(this.learnplaceRepository.exists(it.id));
                    }

                    return Observable.of(false);
                }).mergeMap(exists => {

                    if(exists) {
                        this.log.warn(() => `Learnplace with object id "${objectId}" could not be loaded, but is available from local storage`);
                        return Observable.empty();
                    }

                    return Observable.throw(new LearnplaceLoadingError(`Could not load learnplace with id "${objectId}" over http connection`));

                }).toPromise();
        });
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
