
import { mergeMap, filter, takeWhile, map, tap, catchError, withLatestFrom, takeUntil } from "rxjs/operators";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/learnplace/rest/learnplace.api";
import {VISIT_JOURNAL_REPOSITORY, VisitJournalRepository} from "../../providers/learnplace/repository/visitjournal.repository";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {LocationWatch} from "./location";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/learnplace/repository/learnplace.repository";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {Geolocation} from "../../services/device/geolocation/geolocation.service";
import {isDefined} from "../../util/util.function";
import {IllegalStateError} from "../../error/errors";
import {IliasCoordinates} from "./geodesy";
import {LearnplaceEntity, VisitJournalEntity} from "../../entity/learnplace/learnplace.entity";
import {UserEntity} from "../../entity/user.entity";
import { Observable, from, combineLatest, of, Subject } from "rxjs";

/**
 * Describes a synchronization that manages un-synchronized visit journal entries.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface VisitJournalSynchronization {

    /**
     * Synchronizes local journal entries that could not be synchronized
     * to ILIAS during their creations.
     */
    synchronize(): Promise<void>
}
export const VISIT_JOURNAL_SYNCHRONIZATION: InjectionToken<VisitJournalSynchronization> = new InjectionToken("token for VisitJournalSynchronization");

/**
 * Manages un-synchronized visit journal entries.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class VisitJournalSynchronizationImpl implements VisitJournalSynchronization {

    private readonly log: Logger = Logging.getLogger(VisitJournalSynchronizationImpl.name);

    constructor(
        @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
        @Inject(VISIT_JOURNAL_REPOSITORY) private readonly visitJournalRepository: VisitJournalRepository
    ) {}

    /**
     * Synchronizes local journal entries that could not be synchronized
     * to ILIAS during their creations.
     *
     * If {@link VisitJournalEntity#synchronized} property is set to false
     * it will be picked up by this synchronization. If the synchronization
     * still fails it remains unmodified. If the synchronization is successful
     * its synchronized property will be set to true.
     */
    async synchronize(): Promise<void> {
        const unsynchronized: Array<VisitJournalEntity> = await this.visitJournalRepository.findUnsynchronized();
        console.error(unsynchronized);
        for (const it of unsynchronized) {
            try {
                await this.learnplaceAPI.addJournalEntry(it.learnplace.objectId, it.time);
                it.synchronized = true;
                await this.visitJournalRepository.save(it);
            } catch(error) {
                this.log.warn(() => `Could not synchronize journal entry: id=${it.id}`);
                this.log.debug(() => `Synchronize Journal Entry Error: ${JSON.stringify(error)}`);
            }
        }
    }
}

/**
 * Describes a location watch for the visit journal of a learnplace.
 * Compares the device's location with the location of the learnplace
 * specified by the {@link VisitJournalWatch#setLearnplace} method.
 *
 * If the device is close enough to the learnplace's location,
 * the current user will be marked as someone who has visited the learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface VisitJournalWatch extends LocationWatch {

    /**
     * Sets the id for the learnplace to use for the visit journal.
     *
     * @param {number} objectId - ILIAS object id of the learnplace
     */
    setLearnplace(objectId: number): void;
}
export const VISIT_JOURNAL_WATCH: InjectionToken<VisitJournalWatch> = new InjectionToken<VisitJournalWatch>("token for visit journal watch");

/**
 * Synchronizes the visit journal of a learnplace with ILIAS.
 * The current user will be considered in order to know the appropriate ILIAS installation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.1
 */
@Injectable()
export class SynchronizedVisitJournalWatch implements VisitJournalWatch {

    private readonly dispose$: Subject<void> = new Subject<void>();
    private learnplaceObjectId: number | undefined = undefined;

    private readonly log: Logger = Logging.getLogger(SynchronizedVisitJournalWatch.name);

    constructor(
        @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly geolocation: Geolocation
    ) {}


    setLearnplace(objectId: number): void {
        console.error("starting visitjournal on " + objectId);
        this.learnplaceObjectId = objectId;
    }

    /**
     * Starts watching the device's location and compares it with the learnplace location.
     * If the device is near enough to the learnplace, it will mark the current user as visited.
     *
     * The device is near enough to the learnplace by considering the {@link Coordinates#isNearTo} method with
     * the latitude and longitude of the device's and learnplace location, as well as the radius defined on the learnplace.
     */
    start(): void {

        if(!isDefined(this.learnplaceObjectId)) {
            throw new IllegalStateError(`Can not start ${SynchronizedVisitJournalWatch.name} without learnplace id`);
        }

        const user: Observable<UserEntity> = from(this.userRepository.findAuthenticatedUser()).pipe(map(it => it.get()));

        const learnplace: Observable<LearnplaceEntity> = user.pipe(
            mergeMap(it => this.learnplaceRepository.findByObjectIdAndUserId(this.learnplaceObjectId, it.id)),
            map(it => it.get())
        );

        this.log.trace(() => "Start watching the device's location");
        const position: Observable<IliasCoordinates> = this.geolocation.watchPosition().pipe(
            filter(it => isDefined(it.coords)), // filter errors
            map(it => new IliasCoordinates(it.coords.latitude, it.coords.longitude)),
            takeUntil(this.dispose$)
        );

        combineLatest([user, learnplace, position])
            .pipe(
                filter(this.checkConditions),
                map((it: [UserEntity, LearnplaceEntity, IliasCoordinates]): VisitJournalEntity => {

                    const user: UserEntity = it[0];

                    return new VisitJournalEntity().applies<VisitJournalEntity>(function(): void {
                        this.userId = user.iliasUserId;
                        this.time = Math.floor(Date.now() / 1000); // unix time in seconds
                        this.synchronized = false;
                    })
                }),
                mergeMap((it: VisitJournalEntity) => from(this.learnplaceAPI.addJournalEntry(this.learnplaceObjectId, it.time))
                    .pipe(
                        map(_ => it),
                        tap(it => { it.synchronized = true; }),
                        catchError((..._) => of(it))
                    )
                ),
                withLatestFrom(learnplace, (visitJournal: VisitJournalEntity, learnplace: LearnplaceEntity): LearnplaceEntity =>
                    learnplace.applies<LearnplaceEntity>(function(): void {
                        this.visitJournal.push(visitJournal);
                })),
                takeUntil(this.dispose$)
            )
            .subscribe((it: LearnplaceEntity) => {
                console.error("updating lp")
                this.learnplaceRepository.save(it);
            });
    }

    /**
     * Stops watching the device's location.
     */
    stop(): void {
        this.dispose$.next();
    }

    /**
     * Checks, if the conditions are met when the device location needs to be handled.
     *
     * @param {[UserEntity , LearnplaceEntity , Coordinates]} it - a triple of user, learnplace and current coordinates
     *
     * @return {boolean} true if the conditions are met, otherwise false
     */
    private checkConditions(it: [UserEntity, LearnplaceEntity, IliasCoordinates]): boolean {
        const [user, learnplace, position]: [UserEntity, LearnplaceEntity, IliasCoordinates] = it;

        if (isDefined(learnplace.visitJournal.find(it => it.userId == user.iliasUserId))) {
            return false;
        }

        const learnplaceCoordinates: IliasCoordinates = new IliasCoordinates(learnplace.location.latitude, learnplace.location.longitude);

        return position.isNearTo(learnplaceCoordinates, learnplace.location.radius);
    }
}
