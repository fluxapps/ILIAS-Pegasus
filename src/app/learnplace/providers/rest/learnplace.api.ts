import { Inject, Injectable, InjectionToken } from "@angular/core";
import { ILIASObject } from "../../../models/ilias-object";
import { User } from "../../../models/user";
import { HttpResponse } from "../../../providers/http";
import { DesktopData } from "../../../providers/ilias-rest.provider";
import { ILIAS_REST, ILIASRequestOptions, ILIASRest } from "../../../providers/ilias/ilias.rest";
import { Logger } from "../../../services/logging/logging.api";
import { Logging } from "../../../services/logging/logging.service";
import { blocksJsonSchema, iliasObjectJsonSchema, journalEntriesJsonSchema, learnplaceJsonSchema } from "./json.schema";
import { BlockObject, ILIASLinkBlock, JournalEntry, LearnPlace } from "./learnplace.pojo";

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
      `/v2/ilias-app/learnplace/${learnplaceObjectId}/journal-entry`,
      {time: Math.floor(time)},
      <ILIASRequestOptions>{contentType: "application/json"}
    );

    return response.handle<void>(_ => {
      this.log.trace(() => "Successful post journal entry to ILIAS");
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

    const blocks: BlockObject = response.handle<BlockObject>(it =>
      it.json<BlockObject>(blocksJsonSchema)
    );

    await this.downloadLinkBlockRelatedILIASObject(blocks);
    return blocks;
  }

    /**
     * Downloads the link block related ILIAS object.
     *
     * @param {BlockObject} blocks - The blocks of the current learnplace, which are used to fetch the related ilias objects
     * @private
     */
  private async downloadLinkBlockRelatedILIASObject(blocks: BlockObject): Promise<void> {
      try {
          const linkBlocks: Array<ILIASLinkBlock> = blocks.iliasLink.concat(
              blocks.accordion.reduceRight(
                  (prev, curr) => prev.concat(curr.iliasLink),
                  new Array<ILIASLinkBlock>())
          );

          if (linkBlocks.length === 0) {
              return;
          }

          const user: User = await User.currentUser();
          const pendingDownloads: Array<Promise<HttpResponse>> = new Array<Promise<HttpResponse>>();
          const objNotFoundLocally: Map<number, ILIASObject> = new Map<number, ILIASObject>();
          for (const linkBlock of linkBlocks) {
              const localObject: ILIASObject = await ILIASObject.findByRefIdAndUserId(linkBlock.refId, user.id);
              if (localObject.id === 0) {
                  pendingDownloads.push(
                      this.iliasRest.get(`/v3/ilias-app/object/${linkBlock.refId}`, DEFAULT_REQUEST_OPTIONS)
                  );
                  objNotFoundLocally.set(linkBlock.refId, localObject);
              }
          }

          const finishedDownloads: Array<HttpResponse> = await Promise.all(pendingDownloads);

          const iliasObjects: Array<DesktopData> = finishedDownloads.map(
              (response) => response.handle<DesktopData>(
                  (it) => it.json(iliasObjectJsonSchema)
              )
          );

          for (const remoteObject of iliasObjects) {
              const localObject: ILIASObject = objNotFoundLocally.get(parseInt(remoteObject.refId, 10));
              localObject.readFromObject(remoteObject);
              await localObject.save();
          }
      } catch (error) {
          // We can't rethrow the error because some of the installation don't have the REST Plugin upgrades jet ... (19.08.2020)
          if (!!error.prototype) {
              this.log.warn(() => `Failed to download link block related ilias objects, with error: [error=${error.prototype.name}, message="${error.message}"]`);
          }

          this.log.warn(() => `Failed to download link block related ilias objects, with error: [error=unknown, message="${error.message}"]`);
      }
  }
}
