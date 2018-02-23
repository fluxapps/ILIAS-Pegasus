/**
 * Indicates that there is no element available.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class NoSuchElementError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NoSuchElementError.prototype);
  }
}

/**
 * Indicates an argument that is not valid.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class IllegalArgumentError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, IllegalArgumentError.prototype);
  }
}
  
/*
 * Describes an illegal state of a class.
 *
 * For example a builder requires data like the ILIAS ref id to
 * actually build the instance but the consumer of the builder just calls build
 * and omits the ref id setter call this error would be thrown to indicate that
 * the builder is not ready to build the link. Therefore, the builder is in an illegal state
 * for the build operation.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export class IllegalStateError extends Error {

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, IllegalStateError.prototype);
  }
}
