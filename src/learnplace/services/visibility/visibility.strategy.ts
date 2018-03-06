import {VisibilityAware} from "./visibility.context";
import {Inject, Injectable} from "@angular/core";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {Geolocation, GeolocationOptions} from "@ionic-native/geolocation";
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {NoSuchElementError} from "../../../error/errors";
import {Coordinates} from "../../../services/geodesy";
import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/rest/learnplace.api";
import {isDefined} from "ionic-angular/es2015/util/util";
import {Subscription} from "rxjs/Subscription";
import {VisitJournalEntity} from "../../entity/visit-journal.entity";
import {USER_REPOSITORY, UserRepository} from "../../../providers/repository/repository.user";
import {UserEntity} from "../../../entity/user.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Platform} from "ionic-angular";

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
 * @version 1.0.0
 */
export interface VisibilityStrategy {

  /**
   * Uses this strategy on the given {@code object}.
   *
   * @param {VisibilityAware} object the block to use in this strategy
   */
  on(object: VisibilityAware): void
}

/**
 * Describes a visibility strategy that has knowlegde about the membership of the used {@code VisibilityAware} model.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MembershipAwareStrategy extends VisibilityStrategy {

  /**
   * Sets the membership of the model used in this strategy.
   *
   * @param {number} id - the id of the object where the model belongs to
   *
   * @returns {VisibilityStrategy} this strategy instance
   */
  membership(id: number): VisibilityStrategy;
}

/**
 * Strategy, that will always set the block visibility to visible.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class AlwaysStrategy implements VisibilityStrategy {

  /**
   * Sets the {@code visible} property of the given {@code object} to true.
   *
   * @param {VisibilityAware} object the block to use in this strategy
   */
  on(object: VisibilityAware): void { object.visible = true }
}

/**
 * Strategy, that will always set the block visibility to invisible.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class NeverStrategy implements VisibilityStrategy {

  /**
   * Sets the {@code visible} property of the given {@code object} to false.
   *
   * @param {VisibilityAware} object the block to use in this strategy
   */
  on(object: VisibilityAware): void { object.visible = false }
}

/**
 * Strategy, that will set the block visibility to visible,
 * if the current position matches the learnplace position.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class OnlyAtPlaceStrategy implements MembershipAwareStrategy {

  private membershipId: number = -1;

  private readonly log: Logger = Logging.getLogger(OnlyAtPlaceStrategy.name);

  constructor(
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly geolocation: Geolocation,
    private readonly platform: Platform
  ) {}

  /**
   * Sets the membership of the object used in this strategy.
   *
   * @param {number} id
   * @returns {VisibilityStrategy}
   */
  membership(id: number): VisibilityStrategy {
    this.membershipId = id;
    return this;
  }

  /**
   * Watches the current position and sets the visibility of the given {@code object}
   * to true, if its 'near' to the learnplace with the matching membership specified by {@link OnlyAtPlaceStrategy#membership} method.
   *
   * The current position is considered as 'near', if the distance of the current position
   * to the learnplace position is in the learnplace radius.
   *
   * This method is executed asynchronously and can not be used with await or Promise#then.
   *
   * @param {VisibilityAware} object - the object to use in this strategy
   */
  on(object: VisibilityAware): void {
    this.execute(object);
  }

  /**
   * Helper method to enable async/await.
   */
  private async execute(object: VisibilityAware): Promise<void> {

    await this.platform.ready();

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(this.membershipId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${this.membershipId}`));

    const learnplaceCoordinates: Coordinates = new Coordinates(learnplace.location.latitude, learnplace.location.longitude);

    this.log.info(() => "Watch position for visibility 'Only at Place'");
    this.geolocation.watchPosition()
      .filter(p => isDefined(p.coords))
      .subscribe(location => {

      const currentCoordinates: Coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);

      this.log.trace(() => `Current position: latitude=${currentCoordinates.latitude}, longitude=${currentCoordinates.longitude}`);

      object.visible = learnplaceCoordinates.isNearTo(currentCoordinates, learnplace.location.radius);
    });
  }
}

/**
 * Strategy, that will set the {@code VisibilityAware} model to visible,
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class AfterVisitPlaceStrategy implements MembershipAwareStrategy {

  private membershipId: number = -1;

  constructor(
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    private readonly geolocation: Geolocation,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  /**
   * Sets the membership of the object used in this strategy.
   *
   * @param {number} id
   * @returns {VisibilityStrategy}
   */
  membership(id: number): VisibilityStrategy {
    this.membershipId = id;
    return this;
  }

  /**
   * Checks if the current user is in the journal entry of the learnplace matching the {@code AfterVisitPlaceStrategy#membership} id.
   * If the user exists in the journal, the visibility of the given {@code object} is set to true.
   *
   * Otherwise, the current position is watched and sets the visibility of the given {@code object}
   * to true, if its 'near' to the learnplace. In addition a new journal entry will be added to the learnplace.
   * If the post request to add a journal entry fails, it will be retried with the next synchronization.
   *
   * The current position is considered as 'near', if the distance of the current position
   * to the learnplace position is in the learnplace radius. Once the current position is 'near' to
   * the learnplace, it will stop watching the current position.
   *
   * This method is executed asynchronously and can not be used with await or Promise#then.
   *
   * @param {VisibilityAware} object - the object to use in this strategy
   */
  on(object: VisibilityAware): void {
    this.execute(object);
  }

  /**
   * Helper method to enable async/await.
   */
  private async execute(object: VisibilityAware): Promise<void> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(this.membershipId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace foud: id=${this.membershipId}`));

    const user: UserEntity = (await this.userRepository.findAuthenticatedUser()).get();

    if (isDefined(learnplace.visitJournal.find(it => it.username == user.iliasLogin))) {
      object.visible = true;
      return;
    }

    const learnplaceCoordinates: Coordinates = new Coordinates(learnplace.location.latitude, learnplace.location.longitude);

    const watch: Subscription = this.geolocation.watchPosition().subscribe(async(location) => {

      const currentCoordinates: Coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);

      if (learnplaceCoordinates.isNearTo(currentCoordinates, learnplace.location.radius)) {
        watch.unsubscribe();

        object.visible = true;

        const visitJournalEntity: VisitJournalEntity = new VisitJournalEntity().applies(function(): void {
          this.username = user.iliasLogin;
          this.time = Date.now() / 1000; // unix time in seconds
          this.synchronized = false;
        });

        learnplace.visitJournal.push(visitJournalEntity);

        try {

          await this.learnplaceAPI.addJournalEntry(this.membershipId, visitJournalEntity.time);

          visitJournalEntity.synchronized = true;
        } finally {
          await this.learnplaceRepository.save(learnplace);
        }
      }
    });
  }
}
