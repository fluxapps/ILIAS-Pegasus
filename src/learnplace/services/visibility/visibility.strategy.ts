/** angular */
import {Inject, Injectable} from "@angular/core";
import {isDefined} from "ionic-angular/es2015/util/util";
/** ionic-native */
import {Geolocation} from "@ionic-native/geolocation/ngx";
/** services */
import {Coordinates} from "../../../services/geodesy";
/** providers */
import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/rest/learnplace.api";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/repository/learnplace.repository";
/** entries */
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {UserEntity} from "../../../entity/user.entity";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
/** rxjs */
import {Observable} from "rxjs/Observable";
import {Subscriber} from "rxjs/Subscriber";
import {Subscription} from "rxjs/Subscription";
/** logging */
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
/** misc */
import {NoSuchElementError} from "../../../error/errors";
import {VisibilityAware} from "./visibility.context";

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
@Injectable({
    providedIn: "root"
})
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
@Injectable({
    providedIn: "root"
})
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
    return Observable.create((subscriber: Subscriber<T>) => {
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
@Injectable({
    providedIn: "root"
})
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
    return Observable.create(async(subscriber: Subscriber<T>) => {

      subscriber.next(object);

      const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(this.membershipId))
        .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${this.membershipId}`));

      const learnplaceCoordinates: Coordinates = new Coordinates(learnplace.location.latitude, learnplace.location.longitude);

      this.log.trace(() => "Watch position for visibility 'Only at Place'");
      this.watch = this.geolocation.watchPosition()
        .filter(it => isDefined(it.coords))
        .subscribe(location => {

          const currentCoordinates: Coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);

          object.visible = learnplaceCoordinates.isNearTo(currentCoordinates, learnplace.location.radius);
          subscriber.next(object);
        });
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
@Injectable({
    providedIn: "root"
})
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
      const learnplace: Observable<LearnplaceEntity> = Observable.fromPromise(this.learnplaceRepository.find(this.membershipId))
          .map(it => it.orElseThrow(() => new NoSuchElementError(`No learnplace found with id: ${this.membershipId}`)));

      const user: Observable<UserEntity> = Observable.fromPromise(this.userRepository.findAuthenticatedUser())
          .map(it => it.get());

      const learnplaceCoordinate: Observable<Coordinates> = learnplace.map(it => new Coordinates(it.location.latitude, it.location.longitude));

      return Observable.forkJoin(learnplace, user, learnplaceCoordinate, (learnplace, user, learnplaceCoordinates) => {
          if (isDefined(learnplace.visitJournal.find(it => it.userId == user.iliasUserId))) {
              object.visible = true;
              return Observable.of(object);
          }

          return Observable.of(
              Observable.of(object),
              this.geolocation.watchPosition()
                  .takeWhile(() => this.running)
                  .filter(it => isDefined(it.coords))
                  .filter(it => {
                      const currentCoordinates: Coordinates = new Coordinates(it.coords.latitude, it.coords.longitude);
                      return learnplaceCoordinates.isNearTo(currentCoordinates, learnplace.location.radius);
                  })
                  .mergeMap((_) => {
                      const journal: VisitJournalEntity = new VisitJournalEntity();
                      journal.learnplace = learnplace;
                      journal.synchronized = false;
                      journal.time = Date.now() / 1000;
                      learnplace.visitJournal.push(journal);
                      return Observable.fromPromise(this.learnplaceAPI.addJournalEntry(learnplace.objectId, journal.time))
                          .map((_) => journal);
                  })
                  .do((it) => {
                      it.synchronized = true;
                  })
                  .finally(() => {
                      return Observable.fromPromise(this.learnplaceRepository.save(learnplace));
                  })
                  .map((_) => {
                      object.visible = true;
                      this.shutdown();
                      return object;
                  })
          ).mergeAll();
      }).mergeAll();
  }

  /**
   * Stops watching the device's location.
   */
  shutdown(): void {
    this.running = false;
  }
}
