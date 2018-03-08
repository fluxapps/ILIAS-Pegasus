import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_API, LearnplaceAPI} from "../providers/rest/learnplace.api";
import {VISIT_JOURNAL_REPOSITORY, VisitJournalRepository} from "../providers/repository/visitjournal.repository";
import {VisitJournalEntity} from "../entity/visit-journal.entity";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {LocationWatch} from "../../services/location";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {Geolocation} from "@ionic-native/geolocation";
import {isDefined, isUndefined} from "ionic-angular/es2015/util/util";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {Coordinates} from "../../services/geodesy";
import {Subscription} from "rxjs/Subscription";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {UserEntity} from "../../entity/user.entity";

/**
 * Describes a synchronization that manages un-synchronized visit journal entries.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
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
 * @version 0.0.1
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
   * @param {number} id - the object id of the learnplace
   */
  setLearnplace(id: number): void;
}
export const VISIT_JOURNAL_WATCH: InjectionToken<VisitJournalWatch> = new InjectionToken<VisitJournalWatch>("token for visit journal watch");

/**
 * Synchronizes the visit journal of a learnplace with ILIAS.
 * The current user will be considered in order to know the appropriate ILIAS installation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class SynchronizedVisitJournalWatch implements VisitJournalWatch {

  private learnplaceId: number | undefined = undefined;
  private watch: Subscription | undefined = undefined;

  private readonly log: Logger = Logging.getLogger(SynchronizedVisitJournalWatch.name);

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly geolocation: Geolocation
  ) {}


  setLearnplace(id: number): void {
    this.learnplaceId = id;
  }

  /**
   * Starts watching the device's location and compares it with the learnplace location.
   * If the device is near enough to the learnplace, it will mark the current user as visited.
   *
   * If the current user is already marked as visited or the device location is near enough, this watch will stop itself.
   *
   * The device is near enough to the learnplace by considering the {@link Coordinates#isNearTo} method with
   * the latitude and longitude of the device's and learnplace location, as well as the radius defined on the learnplace.
   */
  start(): void {

    if(isUndefined(this.learnplaceId)) {
      throw new IllegalStateError(`Can not start ${SynchronizedVisitJournalWatch.name} without learnplace id`);
    }

    this.execute();
  }

  /**
   * Stops watching the device's location.
   */
  stop(): void {
    this.watch.unsubscribe();
  }

  /**
   * Helper method to use async / await.
   */
  private async execute(): Promise<void> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(this.learnplaceId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace found: id=${this.learnplaceId}`));
    const user: UserEntity = (await this.userRepository.findAuthenticatedUser()).get();

    const learnplaceCoordinates: Coordinates = new Coordinates(learnplace.location.latitude, learnplace.location.longitude);

    this.log.trace(() => "Watch position for visit journal watch'");

    this.watch = this.geolocation.watchPosition()
      .filter(p => isDefined(p.coords))
      .subscribe(async(location) => {

        if (isDefined(learnplace.visitJournal.find(it => it.userId == user.iliasUserId))) {
          this.stop();
          return;
        }

        const currentCoordinates: Coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);

        if (learnplaceCoordinates.isNearTo(currentCoordinates, learnplace.location.radius)) {

          this.stop();

          const visitJournalEntity: VisitJournalEntity = new VisitJournalEntity().applies(function(): void {
            this.userId = user.iliasUserId;
            this.time = Math.floor(Date.now() / 1000); // unix time in seconds
            this.synchronized = false;
          });

          learnplace.visitJournal.push(visitJournalEntity);

          try {

            await this.learnplaceAPI.addJournalEntry(this.learnplaceId, visitJournalEntity.time);

            // if the entry could be added to ILIAS, set synchronized to true
            visitJournalEntity.synchronized = true;
          } finally {
            await this.learnplaceRepository.save(learnplace);
          }
        }
      });
  }
}
