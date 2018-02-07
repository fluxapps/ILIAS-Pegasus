import {LEARNPLACE_API, LearnplaceAPI} from "../../providers/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {BlockObject, LearnPlace} from "../../providers/rest/learnplace.pojo";
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {LocationEntity} from "../../entity/location.entity";
import {MapEntity} from "../../entity/map.entity";
import {Logging} from "../../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityEntity} from "../../entity/visibility.entity";
import {Logger} from "../../../services/logging/logging.api";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {Optional} from "../../../util/util.optional";
import {apply, withIt} from "../../../util/util.function";
import {HttpRequestError} from "../../../providers/http";
import {LinkBlockMapper, PictureBlockMapper, TextBlockMapper} from "./mappers";

/**
 * A readonly instance of the currently opened learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LearnplaceData {

  /**
   * @returns {number} - the id of the opened learnplace
   * @throws {InvalidLearnplaceError} if this object is in a unusable state
   */
  getId(): number

  /**
   * @returns {string} - the name of the opened learnplace
   * @throws {InvalidLearnplaceError} if this object is in a unusable state
   */
  getName(): string
}
export const LEARNPLACE: InjectionToken<LearnplaceData> = new InjectionToken("token for a learnplace");

/**
 * A mutable instance of the currently opened learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface MutableLearnplaceData extends LearnplaceData {

  /**
   * Sets the id of the learnplace.
   *
   * @param {number} id - the id of the learnplace
   */
  setId(id: number): void

  /**
   * Sets the name of the learnplace.
   *
   * @param {string} name - the name of the learnplace
   */
  setName(name: string): void
}
export const MUT_LEARNPLACE: InjectionToken<MutableLearnplaceData> = new InjectionToken("token for a mutable learnplace");

/**
 * Holds information about the currently opened learnplace.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.1.0
 */
@Injectable()
export class LearnplaceObject implements MutableLearnplaceData {

  private id: number | undefined = undefined;
  private name: string | undefined =undefined;

  getId(): number {
    if (isUndefined(this.id)) {
      throw new InvalidLearnplaceError("Learnplace is not setup: id was never assigned");
    }
    return this.id;
  }

  setId(id: number): void {
    this.id = id;
  }


  getName(): string {
    if (isUndefined(this.name)) {
      throw new InvalidLearnplaceError("Learnplace is not setup: name was never assigned");
    }
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }
}

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
 * @version 1.4.0
 */
@Injectable()
export class RestLearnplaceLoader implements LearnplaceLoader {

  private readonly log: Logger = Logging.getLogger(RestLearnplaceLoader.name);

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository,
    private readonly textBlockMapper: TextBlockMapper,
    private readonly pictureBlockMapper: PictureBlockMapper,
    private readonly linkBlockMapper: LinkBlockMapper
  ) {}

  /**
   * Loads all relevant data of the learnplace matching
   * the given {@code id} and stores them.
   * If the learnplace is already stored, it will be updated.
   *
   * Blocks of an learnplace will be delegated to its according mapper class.
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

      const learnplaceEntity: LearnplaceEntity = (await this.learnplaceRepository.find(id)).orElse(new LearnplaceEntity());

      withIt(learnplaceEntity, it => {

        it.objectId = learnplace.objectId;

        it.map = apply(Optional.ofNullable(it.map).orElse(new MapEntity()), it => {
          it.visibility = apply(new VisibilityEntity(), it => {
            it.value = learnplace.map.visibility;
          })
        });

        it.location = apply(Optional.ofNullable(learnplaceEntity.location).orElse(new LocationEntity()), it => {
          it.latitude = learnplace.location.latitude;
          it.longitude = learnplace.location.longitude;
          it.radius = learnplace.location.radius;
          it.elevation = learnplace.location.elevation;
        });

        it.textBlocks = this.textBlockMapper.map(it.textBlocks, blocks.text);
        it.pictureBlocks = this.pictureBlockMapper.map(it.pictureBlocks, blocks.picture);
        it.linkBlocks = this.linkBlockMapper.map(it.linkBlocks, blocks.iliasLink);
      });

      await this.learnplaceRepository.save(learnplaceEntity);

    } catch (error) {

      if (error instanceof HttpRequestError) {

        if (!(await this.learnplaceRepository.exists(id))) {
          throw new LearnplaceLoadingError(`Could not load learnplace with id "${id}" over http connection`);
        }
        this.log.debug(() => `Learnplace with id "${id} could bot be loaded, but is available from local storage"`);
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
