import {BlockObject, JournalEntry, LearnPlace} from "./learnplace.pojo";
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "../../../providers/ilias/ilias.rest";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {HttpResponse} from "../../../providers/http";
import {blocksJsonSchema, journalEntriesJsonSchema, learnplaceJsonSchema} from "./json.schema";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";

const DEFAULT_REQUEST_OPTIONS: ILIASRequestOptions = <ILIASRequestOptions>{accept: "application/json"};

/**
 * Describes an API abstraction for ILIAS Lernorte 2.0
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
export interface LearnplaceAPI {

  /**
   * Get the learnplace data.
   *
   * @param {number} objectId - the learnplace object id
   *
   * @returns {Promise<LearnPlace>} the resulting learnplace
   * @throws {HttpRequestError} if the request fails
   */
  getLearnPlace(objectId: number): Promise<LearnPlace>

  /**
   * Get all visit journal entries of a learnplace.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<Array<JournalEntry>>} all visit journal entries matching the learnplace
   * @throws {HttpRequestError} if the request fails
   */
  getJournalEntries(learnplaceObjectId: number): Promise<Array<JournalEntry>>

  /**
   * Posts a new journal entry to the learnplace matching the given {@code learnplaceObjectId}.
   *
   * @param {number} learnplaceObjectId - the learnplace objet id
   * @param {number} time - the unix time in seconds to use as the timestamp
   *
   * @throws {HttpRequestError} if the request fails
   */
  addJournalEntry(learnplaceObjectId: number, time: number): Promise<void>

  /**
   * Get all blocks of a learnplace.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<BlockObject>} contains all blocks of the matching learnplace
   * @throws {HttpRequestError} if the request fails
   */
  getBlocks(learnplaceObjectId: number): Promise<BlockObject>
}
export const LEARNPLACE_API: InjectionToken<LearnplaceAPI> = new InjectionToken("token for learnplace api");

/**
 * {@link LearnplaceAPI} implementation for ILIAS.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
@Injectable()
export class ILIASLearnplaceAPI implements LearnplaceAPI {

  private log: Logger = Logging.getLogger(ILIASLearnplaceAPI.name);

  constructor(
    @Inject(ILIAS_REST) private readonly iliasRest: ILIASRest
  ) {}

  /**
   * Get the learnplace data from ILIAS.
   *
   * @param {number} objectId - the learnplace object id
   *
   * @returns {Promise<LearnPlace>} the resulting learnplace
   * @throws {HttpRequestError} if the request fails
   */
  async getLearnPlace(objectId: number): Promise<LearnPlace> {

    const response: HttpResponse = await this.iliasRest.get(`/v2/ilias-app/learnplace/${objectId}`, DEFAULT_REQUEST_OPTIONS);

    return response.handle<LearnPlace>(it =>
      it.json<LearnPlace>(learnplaceJsonSchema)
    );
  }

  /**
   * Get all visit journal entries of a learnplace from ILIAS.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<Array<JournalEntry>>} all visit journal entries matching the learnplace
   * @throws {HttpRequestError} if the request fails
   */
  async getJournalEntries(learnplaceObjectId: number): Promise<Array<JournalEntry>> {

    const response: HttpResponse = await this.iliasRest.get(
      `/v2/ilias-app/learnplace/${learnplaceObjectId}/journal-entries`,
      DEFAULT_REQUEST_OPTIONS);

    return response.handle<Array<JournalEntry>>(it =>
      it.json<Array<JournalEntry>>(journalEntriesJsonSchema)
    );
  }

  /**
   * Posts a new journal entry to the learnplace matching the given {@code learnplaceObjectId}.
   * The body to post is managed by this method, therefore only the learnplace must be specified.
   *
   * @param {number} learnplaceObjectId - the learnplace objet id
   * @param {number} time - the unix time in seconds to use as the timestamp
   *
   * @throws {HttpRequestError} if the request fails
   */
  async addJournalEntry(learnplaceObjectId: number, time: number): Promise<void> {

    const response: HttpResponse = await this.iliasRest.post(
      `/v2/ilias-app/learnplace/${learnplaceObjectId}/journal-entries`,
      {time: time},
      DEFAULT_REQUEST_OPTIONS
    );

    return response.handle<void>(_ => {
      this.log.info(() => "Successful post journal entry to ILIAS");
    });
  }

  /**
   * Get all blocks of a learnplace from ILIAS.
   *
   * @param {number} learnplaceObjectId - the learnplace object id
   *
   * @returns {Promise<BlockObject>} contains all blocks of the matching learnplace
   * @throws {HttpRequestError} if the request fails
   */
  async getBlocks(learnplaceObjectId: number): Promise<BlockObject> {

    const response: HttpResponse = await this.iliasRest.get(`/v2/ilias-app/learnplace/${learnplaceObjectId}/blocks`, DEFAULT_REQUEST_OPTIONS);

    return response.handle<BlockObject>(it =>
      it.json<BlockObject>(blocksJsonSchema)
    );
  }
}
