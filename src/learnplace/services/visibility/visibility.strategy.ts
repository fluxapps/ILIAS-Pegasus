import {VisibilityAware} from "./visibility.context";
import {Injectable} from "@angular/core";
import {LearnplaceRepository} from "../../providers/repository/learnplace.repository";
import {Geolocation} from "@ionic-native/geolocation";
import {LearnplaceEntity} from "../../entity/learnplace.entity";
import {NoSuchElementError} from "../../../error/errors";
import {Coordinates} from "../../../services/geodesy";

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
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export class OnlyAtPlaceStrategy implements MembershipAwareStrategy {

  private membershipId: number = -1;

  constructor(
    private readonly learnplaceRepository: LearnplaceRepository,
    private readonly geolocation: Geolocation
  ) {}

  membership(id: number): VisibilityStrategy {
    this.membershipId = id;
    return this;
  }

  on(object: VisibilityAware): void {
    this.execute(object);
  }

  private async execute(object: VisibilityAware): Promise<void> {

    const learnplace: LearnplaceEntity = (await this.learnplaceRepository.find(this.membershipId))
      .orElseThrow(() => new NoSuchElementError(`No learnplace foud: id=${this.membershipId}`));

    const learnplaceCoordinates: Coordinates = new Coordinates(learnplace.location.latitude, learnplace.location.longitude);

    this.geolocation.watchPosition().subscribe(location => {

      const currentCoordinates: Coordinates = new Coordinates(location.coords.latitude, location.coords.longitude);

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
export class AfterVisitPlaceStrategy implements MembershipAwareStrategy {

  membership(id: number): VisibilityStrategy {
    throw new Error("This method is not implemented yet");
  }

  on(object: VisibilityAware): void {
    throw new Error("This method is not implemented yet");
  }
}
