import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {BlockObject, JournalEntry, LearnPlace} from "../../providers/rest/learnplace.pojo";
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {LocationEntity} from "../../entity/location.entity";
import {MapEntity} from "../../entity/map.entity";
import {Logging} from "../../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityEntity} from "../../entity/visibility.entity";
import {Logger} from "../../../services/logging/logging.api";
import {Optional} from "../../../util/util.optional";
import {HttpRequestError, UnfinishedHttpRequestError} from "../../../providers/http";
import {
  AccordionMapper, LinkBlockMapper, PictureBlockMapper, TextBlockMapper, VideoBlockMapper,
  VisitJournalMapper
} from "./mappers";

/**
 * Describes a loader for a single learnplace.
 * Loads all relevant learnplace data and stores them.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceLoader {

  /**
   * Loads all relevant data of the learnplace matching
   * the given {@code id} and stores them.
   *
   * @param {number} id - the id to use
   *
   * @throws {InvalidLearnplaceError} if the learnplace could not be loaded
   */
  load(id: number): Promise<void>
}
export const LEARNPLACE_LOADER: InjectionToken<LearnplaceLoader> = new InjectionToken("token four learnplace loader");

/**
 * Loads a single learnplace over ILIAS rest and stores
 * them through {@link CRUDRepository}.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.5.0
 */
@Injectable()
export class RestLearnplaceLoader implements LearnplaceLoader {

  private readonly log: Logger = Logging.getLogger(RestLearnplaceLoader.name);

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly textBlockMapper: TextBlockMapper,
    private readonly pictureBlockMapper: PictureBlockMapper,
    private readonly linkBlockMapper: LinkBlockMapper,
    private readonly videoBlockMapper: VideoBlockMapper,
    private readonly accordionMapper: AccordionMapper,
    private readonly visitJournalMapper: VisitJournalMapper
  ) {}

  /**
   * Loads all relevant data of the learnplace matching
   * the given {@code id} and stores them.
   * If the learnplace is already stored, it will be updated.
   *
   * Blocks and visit journal entries of a learnplace will be delegated to its according mapper class.
   *
   * @param {number} id - the id to use
   *
   * @throws {LearnplaceLoadingError} if the learnplace could not be loaded
   */
  async load(id: number): Promise<void> {

    try {

      this.log.info(() => `Load learnplace with id: ${id}`);

      const learnplace: LearnPlace = await this.learnplaceAPI.getLearnPlace(id);
      const blocks: BlockObject = await this.learnplaceAPI.getBlocks(id);
      const journalEntries: Array<JournalEntry> = await this.learnplaceAPI.getJournalEntries(id);

      const learnplaceEntity: LearnplaceEntity = (await this.learnplaceRepository.find(id)).orElse(new LearnplaceEntity());

      learnplaceEntity.objectId = learnplace.objectId;

      learnplaceEntity.map = Optional.ofNullable(learnplaceEntity.map).orElse(new MapEntity()).applies(function(): void {
        this.zoom = learnplace.map.zoomLevel;
        this.visibility = new VisibilityEntity().applies(function(): void {
          this.value = learnplace.map.visibility;
        })
      });

      learnplaceEntity.location = Optional.ofNullable(learnplaceEntity.location).orElse(new LocationEntity()).applies(function(): void {
        this.latitude = learnplace.location.latitude;
        this.longitude = learnplace.location.longitude;
        this.radius = learnplace.location.radius;
        this.elevation = learnplace.location.elevation;
      });

      learnplaceEntity.visitJournal = await this.visitJournalMapper.map(learnplaceEntity.visitJournal, journalEntries);
      learnplaceEntity.textBlocks = await this.textBlockMapper.map(learnplaceEntity.textBlocks, blocks.text);
      learnplaceEntity.pictureBlocks = await this.pictureBlockMapper.map(learnplaceEntity.pictureBlocks, blocks.picture);
      learnplaceEntity.linkBlocks = await this.linkBlockMapper.map(learnplaceEntity.linkBlocks, blocks.iliasLink);
      learnplaceEntity.videoBlocks = await this.videoBlockMapper.map(learnplaceEntity.videoBlocks, blocks.video);
      learnplaceEntity.accordionBlocks = await this.accordionMapper.map(learnplaceEntity.accordionBlocks, blocks.accordion);

      await this.learnplaceRepository.save(learnplaceEntity);

    } catch (error) {

      if (error instanceof HttpRequestError || error instanceof UnfinishedHttpRequestError) {

        if (!(await this.learnplaceRepository.exists(id))) {
          throw new LearnplaceLoadingError(`Could not load learnplace with id "${id}" over http connection`);
        }
        this.log.debug(() => `Learnplace with id "${id}" could bot be loaded, but is available from local storage"`);
        // At the moment nothing needs to be done here
      } else {
        throw error;
      }
    }
  }
}

/**
 * Indicates a invalid state when handling a learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class InvalidLearnplaceError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidLearnplaceError.prototype);
  }
}

/**
 * Indicates, that a learnplace could not be loaded.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class LearnplaceLoadingError extends InvalidLearnplaceError {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, LearnplaceLoadingError.prototype);
  }
}
