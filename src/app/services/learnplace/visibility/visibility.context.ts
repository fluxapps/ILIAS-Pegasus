import {
  AfterVisitPlaceStrategy,
  AlwaysStrategy, NeverStrategy, OnlyAtPlaceStrategy, VisibilityStrategy,
  VisibilityStrategyType
} from "./visibility.strategy";
import {Injectable} from "@angular/core";
import {isDefined} from "../../../util/util.function";
import {IllegalStateError} from "../../../error/errors";
import {Observable} from "rxjs";

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
 * @version 2.0.0
 */
@Injectable()
export class VisibilityStrategyApplier {

  private learnplaceId: string | undefined;

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
   * @param {string} id - the id of the learnplace
   */
  setLearnplace(id: string): void {
     this.learnplaceId = id;
  }

    /**
     * Applies the strategy matching the given {@code strategy} to the given {@code model}.
     *
     * If the setter {@link VisibilityStrategyApplier#setLearnplace} was not called,
     * this method throws an {@link IllegalStateError}.
     *
     * @param {T} model - model to apply the strategy on
     * @param {VisibilityStrategyType} strategy - the strategy type to use
     *
     * @throws {IllegalStateError} if the setter for the learnplace was not called
     */
    apply<T extends VisibilityAware>(model: T, strategy: VisibilityStrategyType): Observable<T> {
        switch (strategy) {
            case VisibilityStrategyType.ALWAYS:
                return this.alwaysStrategy.on(model);
            case VisibilityStrategyType.NEVER:
                return this.neverStrategy.on(model);
            case VisibilityStrategyType.ONLY_AT_PLACE:
                this.requireLearnplace();
                return this.onlyAtPlaceStrategy.membership(this.learnplaceId).on(model);
            case VisibilityStrategyType.AFTER_VISIT_PLACE:
                this.requireLearnplace();
                return this.afterVisitPlace.membership(this.learnplaceId).on(model);
            default:
                console.error("no visiblitiy strategy");
        }
    }

    /**
     * Shutdown the {@link OnlyAtPlaceStrategy} and {@link AfterVisitPlaceStrategy} by invoking their {@code shutdown} method.
     */
    shutdown(): void {
        this.onlyAtPlaceStrategy.shutdown();
        this.afterVisitPlace.shutdown();
    }

   private requireLearnplace(): void {
     if (!isDefined(this.learnplaceId)) {
       throw new IllegalStateError(`Can not apply strategy without learnplace id: Call ${VisibilityStrategyApplier.name}#setLearnplace first`);
     }
   }
}
