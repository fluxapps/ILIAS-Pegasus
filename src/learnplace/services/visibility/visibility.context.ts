import {Block} from "../../block.model";
import {AlwaysStrategy, NeverStrategy, VisibilityStrategy, VisibilityStrategyType} from "./visibility.strategy";

/**
 * Describes a context to revise a visibility on a block.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
export interface VisibilityContext {

  /**
   * Uses the given {@code block} in this context.
   *
   * @param {Block} block the block to use
   */
  use(block: Block): void
}

/**
 * Strategy context, that uses a specific {@link VisibilityStrategy} on a block.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
 class VisibilityStrategyContext implements VisibilityContext{

   constructor(
     private readonly strategy: VisibilityStrategy
   ) {}

  /**
   * Uses the given {@code block} with the set strategy on this context.
   *
   * @param {Block} block
   */
  use(block: Block): void { this.strategy.on(block) }
}

/**
 * Factory class to create a {@link VisibilityContext} depending on a strategy.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
 export class VisibilityContextFactory {

   private readonly strategies: Map<VisibilityStrategyType, VisibilityStrategyContext> = new Map();

   constructor(
     alwaysStrategy: AlwaysStrategy,
     neverStrategy: NeverStrategy
   ) {
     this.strategies.set(VisibilityStrategyType.ALWAYS, new VisibilityStrategyContext(alwaysStrategy));
     this.strategies.set(VisibilityStrategyType.NEVER, new VisibilityStrategyContext(neverStrategy));
   }

  /**
   * Creates a context with the given {@code strategy}.
   *
   * @param {VisibilityStrategyType} strategy the strategy type to use
   * @returns {VisibilityContext}
   */
   create(strategy: VisibilityStrategyType): VisibilityContext {
     return this.strategies.get(strategy);
   }
 }
