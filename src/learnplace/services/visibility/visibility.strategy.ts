import {Block} from "../../block.model";

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
  AFTER_VISIT_PLACE,
  AFTER_VISIT_OTHER_PLACE
}

/**
 * Describes a strategy to handle a specific visibility
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface VisibilityStrategy {

  /**
   * Uses this strategy on the given {@code block}.
   *
   * @param {Block} block the block to use in this strategy
   */
  on(block: Block): void
}

/**
 * Strategy, that will always set the block visibility to visible.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
 class AlwaysStrategy implements VisibilityStrategy {

  /**
   * Sets the {@code visible} property of the given {@code block}to true.
   *
   * @param {Block} block the block to use in this strategy
   */
  on(block: Block): void { block.visible = true }
}

/**
 * Strategy, that will always set the block visibility to invisible.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 0.0.1
 */
 class NeverStrategy implements VisibilityStrategy {

  /**
   * Sets the {@code visible} property of the given {@code block} to false.
   *
   * @param {Block} block the block to use in this strategy
   */
  on(block: Block): void { block.visible = false }
}

// TODO: add all other strategies after the repository layer is implemented
