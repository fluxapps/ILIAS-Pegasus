import {
  AfterVisitPlaceStrategy,
  AlwaysStrategy, NeverStrategy, OnlyAtPlaceStrategy, VisibilityStrategy,
  VisibilityStrategyType
} from "./visibility.strategy";
import {Injectable} from "@angular/core";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {IllegalStateError} from "../../../error/errors";

/**
 * Describes an object that can be visible or not.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface VisibilityAware {
  visible: boolean;
}

/**
 * Helper class to apply a {@link VisibilityStrategy} on a {@link VisibilityAware} model.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.2.1
 */
@Injectable()
export class VisibilityStrategyApplier {

  private learnplaceId: number | undefined;

 constructor(
   private readonly alwaysStrategy: AlwaysStrategy,
   private readonly neverStrategy: NeverStrategy,
   private readonly onlyAtPlaceStrategy: OnlyAtPlaceStrategy,
   private readonly afterVisitPlace: AfterVisitPlaceStrategy
 ) {}

  /**
   * Setter for the learnplace that is used for the membership of models
   * used in the {@link VisibilityStrategyApplier#apply} method.
   *
   * @param {number} id - the object id of the learnplace
   */
  setLearnplace(id: number): void {
     this.learnplaceId = id;
  }

  /**
   * Applies the strategy matching the given {@code strategy} to the given {@code model}.
   *
   * If the setter {@link VisibilityStrategyApplier#setLearnplace} was not called,
   * this method throws an {@link IllegalStateError}.
   *
   * @param {VisibilityAware} model - model to apply the strategy on
   * @param {VisibilityStrategyType} strategy - the strategy type to use
   *
   * @throws {IllegalStateError} if the setter for the learnplace was not called
   */
   apply(model: VisibilityAware, strategy: VisibilityStrategyType): void {

      switch (strategy) {
        case VisibilityStrategyType.ALWAYS:
          this.alwaysStrategy.on(model);
          break;
        case VisibilityStrategyType.NEVER:
          this.neverStrategy.on(model);
          break;
        case VisibilityStrategyType.ONLY_AT_PLACE:
          this.requireLearnplace();
          this.onlyAtPlaceStrategy.membership(this.learnplaceId).on(model);
          break;
        case VisibilityStrategyType.AFTER_VISIT_PLACE:
          this.requireLearnplace();
          this.afterVisitPlace.membership(this.learnplaceId).on(model);
      }
   }

   private requireLearnplace(): void {
     if (isUndefined(this.learnplaceId)) {
       throw new IllegalStateError(`Can not apply strategy without learnplace id: Call ${VisibilityStrategyApplier.name}#setLearnplace first`);
     }
   }
}
