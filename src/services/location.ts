
/**
 * Describes an object, that watches the location of the device
 * and performs a specific task when the location changes.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export interface LocationWatch {

  /**
   * Stars watching the device's location
   * and performs a specific task.
   */
  start(): void;

  /**
   * Stops watching the device's location.
   */
  stop(): void;
}
