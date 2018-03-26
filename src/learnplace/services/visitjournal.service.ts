import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_API, LearnplaceAPI} from "../providers/rest/learnplace.api";
import {VISIT_JOURNAL_REPOSITORY, VisitJournalRepository} from "../providers/repository/visitjournal.repository";
import {VisitJournalEntity} from "../entity/visit-journal.entity";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {LocationWatch} from "../../services/location";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {Geolocation, Geoposition} from "@ionic-native/geolocation";
import {isDefined, isUndefined} from "ionic-angular/es2015/util/util";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {Coordinates} from "../../services/geodesy";
import {Subscription} from "rxjs/Subscription";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {UserEntity} from "../../entity/user.entity";
import {Observable} from "rxjs/Observable";

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

        try {
            const unsynchronized: Array<VisitJournalEntity> = await this.visitJournalRepository.findUnsynchronized();

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
        catch (error) {

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

    private learnplaceObjectId: number | undefined = undefined;

    private running: boolean = false;

    private readonly log: Logger = Logging.getLogger(SynchronizedVisitJournalWatch.name);

    constructor(
        @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly geolocation: Geolocation
    ) {}


    setLearnplace(objectId: number): void {
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

        if(isUndefined(this.learnplaceObjectId)) {
            throw new IllegalStateError(`Can not start ${SynchronizedVisitJournalWatch.name} without learnplace id`);
        }

        this.running = true;

        const user: Observable<UserEntity> = Observable.fromPromise(this.userRepository.findAuthenticatedUser()).map(it => it.get());

        const learnplace: Observable<LearnplaceEntity> = user
            .mergeMap(it => this.learnplaceRepository.findByObjectIdAndUserId(this.learnplaceObjectId, it.id))
            .map(it => it.get());

        this.log.trace(() => "Start watching the device's location")
        const position: Observable<Coordinates> = this.geolocation.watchPosition()
            .filter(it => isDefined(it.coords)) // filter errors
            .map(it => new Coordinates(it.coords.latitude, it.coords.longitude))
            .takeWhile(_ => this.running);

        Observable.combineLatest(user, learnplace, position)
            .filter(this.checkConditions)
            .map(it => {

                const user: UserEntity = it[0];

                return new VisitJournalEntity().applies<VisitJournalEntity>(function(): void {
                    this.userId = user.iliasUserId;
                    this.time = Math.floor(Date.now() / 1000); // unix time in seconds
                    this.synchronized = false;
                })
            })
            .mergeMap(it => Observable.fromPromise(this.learnplaceAPI.addJournalEntry(this.learnplaceObjectId, it.time))
            .map(_ => it)
            .do(it => it.synchronized = true)
            .catch((..._) => Observable.of(it))
        ).combineLatest(learnplace, (visitJournal, learnplace) => learnplace.applies<LearnplaceEntity>(function(): void {
            this.visitJournal.push(visitJournal)
        })).subscribe(it => {
            this.learnplaceRepository.save(it);
        });
    }

    /**
     * Stops watching the device's location.
     */
    stop(): void {
        this.running = false;
    }

    /**
     * Checks, if the conditions are met when the device location needs to be handled.
     *
     * @param {[UserEntity , LearnplaceEntity , Coordinates]} it - a triple of user, learnplace and current coordinates
     *
     * @return {boolean} true if the conditions are met, otherwise false
     */
    private checkConditions(it: [UserEntity, LearnplaceEntity, Coordinates]): boolean {

        const [user, learnplace, position]: [UserEntity, LearnplaceEntity, Coordinates] = it;

        if (isDefined(learnplace.visitJournal.find(it => it.userId == user.iliasUserId))) {
            return false;
        }

        const learnplaceCoordinates: Coordinates = new Coordinates(learnplace.location.latitude, learnplace.location.longitude);

        return position.isNearTo(learnplaceCoordinates, learnplace.location.radius);
    }
}
