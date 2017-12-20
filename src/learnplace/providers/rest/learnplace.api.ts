import {BlockObject, JournalEntry, LearnPlace} from "./learnplace.pojo";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "../../../providers/ilias/ilias.rest";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {HttpResponse} from "../../../providers/http";
import {blocksJsonSchema, journalEntriesJsonSchema, learnplaceJsonSchema} from "./json.schema";

const DEFAULT_REQUEST_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};

/**
 * Describes an API abstraction for ILIAS Lernorte 2.0
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceAPI {

  /**
   * Get the learnplace data.
   *
   * @param {number} objectId - the learnplace object id
   *
   * @returns {Promise<LearnPlace>} the resulting learnplace
   */
  getLearnPlace(objectId: number): Promise<LearnPlace>

  /**
   * Get all visit journal entries of a learnplace.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<Array<JournalEntry>>} all visit journal entries matching the learnplace
   */
  getJournalEntries(learnplaceObjectId: number): Promise<Array<JournalEntry>>

  /**
   * Get all blocks of a learnplace.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<BlockObject>} contains all blocks of the matching learnplace
   */
  getBlocks(learnplaceObjectId: number): Promise<BlockObject>
}

/**
 * {@link LearnplaceAPI} implementation for ILIAS.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
@Injectable()
export class ILIASLearnplaceAPI implements LearnplaceAPI {

  constructor(
    @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest
  ) {}

  /**
   * Get the learnplace data from ILIAS.
   *
   * @param {number} objectId - the learnplace object id
   *
   * @returns {Promise<LearnPlace>} the resulting learnplace
   */
  async getLearnPlace(objectId: number): Promise<LearnPlace> {

    const response: HttpResponse = await this.iliasRest.get(`/v1/learnplace/${objectId}`, DEFAULT_REQUEST_OPTIONS);

    return response.handle<LearnPlace>(async(it) =>
      it.json<LearnPlace>(learnplaceJsonSchema)
    );
  }

  /**
   * Get all visit journal entries of a learnplace from ILIAS.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<Array<JournalEntry>>} all visit journal entries matching the learnplace
   */
  async getJournalEntries(learnplaceObjectId: number): Promise<Array<JournalEntry>> {

    const response: HttpResponse = await this.iliasRest.get(`/v1/learnplace/${learnplaceObjectId}/journal-entries`, DEFAULT_REQUEST_OPTIONS);

    return response.handle<Array<JournalEntry>>(async(it) =>
      it.json<Array<JournalEntry>>(journalEntriesJsonSchema)
    );
  }

  /**
   * Get all blocks of a learnplace from ILIAS.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<BlockObject>} contains all blocks of the matching learnplace
   */
  async getBlocks(learnplaceObjectId: number): Promise<BlockObject> {

    const response: HttpResponse = await this.iliasRest.get(`/v1/learnplace/${learnplaceObjectId}/blocks`, DEFAULT_REQUEST_OPTIONS);

    return response.handle<BlockObject>(async(it) =>
      it.json<BlockObject>(blocksJsonSchema)
    );
  }
}
const LEARNPLACE_API: InjectionToken<LearnplaceAPI> = new InjectionToken("token for learnplace api");
