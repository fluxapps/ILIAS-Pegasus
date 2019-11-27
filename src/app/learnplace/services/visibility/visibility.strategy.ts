import {VisibilityAware} from "./visibility.context";
import {Inject, Injectable} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {NoSuchElementError} from "../../../error/errors";
import {Geolocation} from "../../../services/device/geolocation/geolocation.service";
import {IliasCoordinates} from "../geodesy";
import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/rest/learnplace.api";
import {isDefined} from "../../../util/util.function";
import {Subscription} from "rxjs/Subscription";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import { filter, map, combineLatest, withLatestFrom, takeWhile, mergeMap, tap, finalize, mergeAll, shareReplay } from "rxjs/operators";
import { from, of, forkJoin, TeardownLogic } from "rxjs";

/**
 * Enumerator for available strategies.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export enum VisibilityStrategyType {
    ALWAYS,
    NEVER,
    ONLY_AT_PLACE,
    AFTER_VISIT_PLACE
}

/**
 * Describes a strategy to handle a specific visibility
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 2.0.0
 */
export interface VisibilityStrategy {

    /**
     * Uses this strategy on the given {@code object}.
     * The returned observable will notify its subscribers every time
     * this strategy changes the given {@code object}.
     *
     * The updated {@code object} will be given to the observable's subscribers.
     *
     * @param {T} object - the block to use in this strategy
     *
     * @return {Observable<T>} an observable for the given {@code object}
     */
    on<T extends VisibilityAware>(object: T): Observable<T>
}

/**
 * Describes a visibility strategy that can be shutdown,
 * in order to make sure all depending tasks are finished or aborted.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface ShutdownVisibilityStrategy extends VisibilityStrategy {

    /**
     * Makes sure that this strategy stops every depending task.
     */
    shutdown(): void;
}

/**
 * Describes a visibility strategy that has knowledge about the membership of the used {@code VisibilityAware} model.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MembershipAwareStrategy extends VisibilityStrategy {

    /**
     * Sets the membership of the model used in this strategy.
     *
     * @param {string} id - the id of the object where the model belongs to
     *
     * @returns {VisibilityStrategy} this strategy instance
     */
    membership(id: string): VisibilityStrategy;
}

/**
 * Strategy, that will always set the block visibility to visible.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class AlwaysStrategy implements VisibilityStrategy {

    /**
     * Sets the {@code visible} property of the given {@code object} to true,
     * notifies the subscriber of the returned observable and completes it.
     *
     * @param {T} object - the block to use in this strategy
     *
     * @return {Observable<T>} an observable for the given {@code object}
     */
    on<T extends VisibilityAware>(object: T): Observable<T> {
        return Observable.create((subscriber: Subscriber<T>) => {
            object.visible = true;
            subscriber.next(object);
            subscriber.complete();
        });
    }
}

/**
 * Strategy, that will always set the block visibility to invisible.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class NeverStrategy implements VisibilityStrategy {

    /**
     * Sets the {@code visible} property of the given {@code object} to false,
     * notifies the subscriber of the returned observable and completes it.
     *
     * @param {T} object - the block to use in this strategy
     *
     * @return {Observable<T>} an observable for the given {@code object}
     */
    on<T extends VisibilityAware>(object: T): Observable<T> {
        return new Observable((subscriber: Subscriber<T>): TeardownLogic => {
            object.visible = false;
            subscriber.next(object);
            subscriber.complete();
        });
    }
}

/**
 * Strategy, that will set the block visibility to visible,
 * if the current position matches the learnplace position.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class OnlyAtPlaceStrategy implements MembershipAwareStrategy, ShutdownVisibilityStrategy {

    private membershipId: string = "";

    private watch: Subscription | undefined = undefined;

    private readonly log: Logger = Logging.getLogger(OnlyAtPlaceStrategy.name);

    constructor(
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        private readonly geolocation: Geolocation
    ) {}

    /**
     * Sets the membership of the object used in this strategy.
     *
     * @param {string} id
     * @returns {VisibilityStrategy}
     */
    membership(id: string): VisibilityStrategy {
        this.membershipId = id;
        return this;
    }

    /**
     * Watches the current position and sets the visibility of the given {@code object}
     * to true, if its 'near' to the learnplace with the matching membership specified by {@link OnlyAtPlaceStrategy#membership} method.
     *
     * If the visibility is set to true, subscriber of the returned observable are notified.
     *
     * The current position is considered as 'near', if the distance of the current position
     * to the learnplace position is in the learnplace radius.
     *
     * @param {T} object - the object to use in this strategy
     *
     * @return {Observable<T>} an observable for the given {@code object}
     */
    on<T extends VisibilityAware>(object: T): Observable<T> {
        return new Observable((subscriber: Subscriber<T>): TeardownLogic => {

            subscriber.next(object);

            const learnplaceCoordinates: Observable<[IliasCoordinates, LearnplaceEntity]> = from(this.learnplaceRepository.find(this.membershipId))
                .pipe(
                    map((it) => it.orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${this.membershipId}`))),
                    map((it): [IliasCoordinates, LearnplaceEntity] => [new IliasCoordinates(it.location.latitude, it.location.longitude), it])
                );

            this.log.trace(() => "Watch position for visibility 'Only at Place'");
            this.watch = this.geolocation.watchPosition()
                .pipe(
                    filter(it => isDefined(it.coords)),
                    withLatestFrom(learnplaceCoordinates)
                )
                .subscribe({
                    next: (location): void => {

                        const learnplace: LearnplaceEntity = location[1][1];
                        const learnplaceCoord: IliasCoordinates = location[1][0];

                        const currentCoordinates: IliasCoordinates = new IliasCoordinates(location[0].coords.latitude, location[0].coords.longitude);
                        object.visible = learnplaceCoord.isNearTo(currentCoordinates, learnplace.location.radius);
                        subscriber.next(object);
                    },
                    error: (err): void => subscriber.error(err),
                    complete: (): void => subscriber.complete()
                });

            return (): void => this.watch.unsubscribe();
        });
    }

    /**
     * Stops watching the device's location.
     */
    shutdown(): void {
        if (isDefined(this.watch))
            this.watch.unsubscribe();
    }
}

/**
 * Strategy, that will set the {@code VisibilityAware} model to visible,
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class AfterVisitPlaceStrategy implements MembershipAwareStrategy, ShutdownVisibilityStrategy {

    private membershipId: string = "";

    private running: boolean = false;

    constructor(
        @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
        @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
        private readonly geolocation: Geolocation,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
    ) {}

    /**
     * Sets the membership of the object used in this strategy.
     *
     * @param {string} id
     * @returns {VisibilityStrategy}
     */
    membership(id: string): VisibilityStrategy {
        this.membershipId = id;
        return this;
    }

    /**
     * Checks if the current user is in the journal entry of the learnplace matching the {@code AfterVisitPlaceStrategy#membership} id.
     * If the user exists in the journal, the visibility of the given {@code object} is set to true,
     * notifies the subscriber of the returned observable and completes it.
     *
     * Otherwise, the current position is watched and sets the visibility of the given {@code object}
     * to true, if its 'near' to the learnplace.
     *
     * The current position is considered as 'near', if the distance of the current position
     * to the learnplace position is in the learnplace radius. Once the current position is 'near' to
     * the learnplace, it will stop watching the current position.
     *
     * @param {T} object - the object to use in this strategy
     *
     * @return {Observable<T>} an observable for the given {@code object}
     */
    on<T extends VisibilityAware>(object: T): Observable<T> {

        this.running = true;
        const learnplace: Observable<LearnplaceEntity> = from(this.learnplaceRepository.find(this.membershipId))
            .pipe(
                map(it => it.orElseThrow(() => new NoSuchElementError(`No learnplace found with id: ${this.membershipId}`))),
                shareReplay(1)
            );

        const user: Observable<UserEntity> = from(this.userRepository.findAuthenticatedUser())
            .pipe(map(it => it.get()));

        const learnplaceCoordinate: Observable<IliasCoordinates> =
            learnplace.map(it => new IliasCoordinates(it.location.latitude, it.location.longitude));

        return forkJoin({learnplace, user, learnplaceCoordinate}).pipe(map((it) => {
            const { learnplace, user, learnplaceCoordinate }:
                {learnplace: LearnplaceEntity, user: UserEntity, learnplaceCoordinate: IliasCoordinates} = it;
            if (isDefined(learnplace.visitJournal.find(it => it.userId == user.iliasUserId))) {
                object.visible = true;
                return of(object);
            }

            return of(
                of(object),
                this.geolocation.watchPosition().pipe(
                    takeWhile(() => this.running),
                    filter(it => isDefined(it.coords)),
                    filter(it => {
                        const currentCoordinates: IliasCoordinates = new IliasCoordinates(it.coords.latitude, it.coords.longitude);
                        return learnplaceCoordinate.isNearTo(currentCoordinates, learnplace.location.radius);
                    }),
                    mergeMap((_) => {
                        const journal: VisitJournalEntity = new VisitJournalEntity();
                        journal.learnplace = learnplace;
                        journal.synchronized = false;
                        journal.time = Date.now() / 1000;
                        learnplace.visitJournal.push(journal);
                        return Observable.fromPromise(this.learnplaceAPI.addJournalEntry(learnplace.objectId, journal.time))
                            .map((_) => journal);
                    }),
                    tap((it) => {
                        it.synchronized = true;
                    }),
                    finalize(() => {
                        return Observable.fromPromise(this.learnplaceRepository.save(learnplace));
                    }),
                    map((_) => {
                        object.visible = true;
                        this.shutdown();
                        return object;
                    })
                )
            ).pipe(mergeAll());
        }), mergeAll());
    }

    /**
     * Stops watching the device's location.
     */
    shutdown(): void {
        this.running = false;
    }
}
