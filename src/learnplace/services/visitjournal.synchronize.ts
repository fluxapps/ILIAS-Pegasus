import {Inject, Injectable, InjectionToken} from "@angular/core";
import {LEARNPLACE_API, LearnplaceAPI} from "../providers/rest/learnplace.api";
import {VISIT_JOURNAL_REPOSITORY, VisitJournalRepository} from "../providers/repository/visitjournal.repository";

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
  synchronize(): Promise<void> {
    throw new Error("This method is not implemented yet");
  }
}
