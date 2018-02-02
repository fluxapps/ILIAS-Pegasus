import {LEARNPLACE_API, LearnplaceAPI} from "../providers/rest/learnplace.api";
import {LEARNPLACE_REPOSITORY, LearnplaceRepository} from "../providers/repository/learnplace.repository";
import {BlockObject, LearnPlace} from "../providers/rest/learnplace.pojo";
import {LearnplaceEntity} from "../entity/learnplace.entity";
import {LocationEntity} from "../entity/location.entity";
import {MapEntity} from "../entity/map.entity";
import {Logging} from "../../services/logging/logging.service";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {VisibilityEntity} from "../entity/visibility.entity";
import {Logger} from "../../services/logging/logging.api";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {Optional} from "../../util/util.optional";
import {addArgv} from "@ionic/app-scripts";
import {apply} from "../../util/util.function";
import {TextblockEntity} from "../entity/textblock.entity";
import {isNullOrUndefined} from "util";

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
 * @version 1.0.0
 */
@Injectable()
export class RestLearnplaceLoader implements LearnplaceLoader {

  private readonly log: Logger = Logging.getLogger(RestLearnplaceLoader.name);

  constructor(
    @Inject(LEARNPLACE_API) private readonly learnplaceAPI: LearnplaceAPI,
    @Inject(LEARNPLACE_REPOSITORY) private readonly learnplaceRepository: LearnplaceRepository
  ) {}

  /**
   * Loads all relevant data of the learnplace matching
   * the given {@code id} and stores them.
   * If the learnplace is already stored, it will be updated.
   *
   * @param {number} id - the id to use
   *
   * @throws {InvalidLearnplaceError} if the learnplace could not be loaded
   */
  async load(id: number): Promise<void> {

    try {

      this.log.info(() => `Load learnplace with id: ${id}`);

      const learnplace: LearnPlace = await this.learnplaceAPI.getLearnPlace(id);
      const blocks: BlockObject = await this.learnplaceAPI.getBlocks(id);

      const learnplaceEntity: LearnplaceEntity = (await this.learnplaceRepository.find(id)).orElse(new LearnplaceEntity());

      learnplaceEntity.objectId = learnplace.objectId;

      learnplaceEntity.map = Optional.ofNullable(learnplaceEntity.map).orElse(new MapEntity());
      learnplaceEntity.map.visibility = this.getVisibilityEntity(learnplace.map.visibility);

      learnplaceEntity.location = Optional.ofNullable(learnplaceEntity.location).orElse(new LocationEntity());
      learnplaceEntity.location.latitude = learnplace.location.latitude;
      learnplaceEntity.location.longitude = learnplace.location.longitude;
      learnplaceEntity.location.radius = learnplace.location.radius;
      learnplaceEntity.location.elevation = learnplace.location.elevation;

      learnplaceEntity.textBlocks = blocks.text.map(textBlock => {
        return apply(this.findIn(learnplaceEntity.textBlocks, textBlock, (entity, block) => entity.content == block.content).orElse(new TextblockEntity()), et => {
          et.sequence = textBlock.sequence;
          et.content = textBlock.content;
          et.visibility = this.getVisibilityEntity(textBlock.visibility);
        })
      });
      learnplaceEntity.pictureBlocks = [];

      await this.learnplaceRepository.save(learnplaceEntity);

    } catch (error) {
      throw new InvalidLearnplaceError(Logging.getMessage(error, "Could not load learnplace"));
    }
  }

  private findIn<K, T>(source: Array<K>, target: T, comparator: (source: K, target: T) => boolean): Optional<K> {
    if (isNullOrUndefined(source)) {
      return Optional.empty();
    }
    return Optional.ofNullable(source.find(it => comparator(it, target)));
  }

  private getVisibilityEntity(visibility: string): VisibilityEntity {
    return apply(new VisibilityEntity(), it => {
      it.value = visibility;
    })
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
