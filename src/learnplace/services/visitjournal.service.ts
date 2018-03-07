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
        this.log.warn(() => `Could not synchronize journal entry: id=${it.id}, username=${it.username}`);
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

/**
 * Synchronizes the visit journal of a learnplace with ILIAS.
 * The current user will be considered in order to know the appropriate ILIAS installation.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class SynchronizedVisitJournalWatch implements VisitJournalWatch {

  private learnplaceId: number | undefined = undefined;

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly geolocation: Geolocation
  ) {}


  setLearnplace(id: number): void {
    this.learnplaceId = id;
  }

  start(): void {
  }

  stop(): void {
  }
}
