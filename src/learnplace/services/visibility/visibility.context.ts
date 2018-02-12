import {AlwaysStrategy, NeverStrategy, VisibilityStrategy, VisibilityStrategyType} from "./visibility.strategy";
import {Injectable} from "@angular/core";
import {withIt} from "../../../util/util.function";

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
 * @version 1.0.0
 */
@Injectable()
export class VisibilityStrategyApplier {

  private readonly strategies: Map<VisibilityStrategyType, VisibilityStrategy> = new Map();

 constructor(
   alwaysStrategy: AlwaysStrategy,
   neverStrategy: NeverStrategy
 ) {
   withIt(this.strategies, it => {
     it.set(VisibilityStrategyType.ALWAYS, alwaysStrategy);
     it.set(VisibilityStrategyType.NEVER, neverStrategy);
   });
 }

/**
 * Applies the strategy matching the given {@code strategy} to the given {@code model}.
 *
 * @param {VisibilityAware} model - model to apply the strategy on
 * @param {VisibilityStrategyType} strategy - the strategy type to use
 */
 apply(model: VisibilityAware, strategy: VisibilityStrategyType): void {
   this.strategies.get(strategy).on(model);
 }
}
