import {isNullOrUndefined} from "util";
import {isUndefined} from "ionic-angular/es2015/util/util";
import {NoSuchElementError} from "../error/errors";

/**
 * A container object which may or may not contain a non-null | non-undefined value.
 * If a value is present, {@code isPresent()} will return true and {@code get()} will return the value.
 *
 * @author nmaerchy <nm@studer-raimann.ch>
 * @version 1.0.0
 */
export class Optional<T> {

  private constructor(
    private readonly value: T | undefined
  ) {}

  /**
   * @returns {Optional<T>} an empty optional instance
   */
  static empty<T>(): Optional<T> { return new Optional<T>(undefined) }

  /**
   * Returns an {@code Optional} with the specific non-null | non-undefined value.
   * If the given {@code value} is null or undefined, this method throws a {@link TypeError}.
   *
   * @param {T} value - non-null | non-undefined value to create the optional
   *
   * @returns {Optional<T>} the resulting {@code Optional}
   */
  static of<T>(value: T): Optional<T> {

    if (isNullOrUndefined(value)) {
      throw new TypeError("the given parameter 'value' must not be null or undefined.");
    }
    return new Optional<T>(value)
  }

  /**
   * Returns an {@code Optional} describing the specified value, if non-null / non-undefined, otherwise returns an empty optional.
   *
   * @param {T | null | undefined} value - the possibly null / undefined value
   *
   * @returns {Optional<T>} the resulting {@code Optional}
   */
  static ofNullable<T>(value: T | undefined | null): Optional<T> {
    if (isNullOrUndefined(value)) {
      return Optional.empty<T>();
    }
    return Optional.of(value);
  }

  /**
   * If a value is present in this {@code Optional}, returns the value, otherwise throws {@link NoSuchElementError}.
   *
   * @returns {T} the value if present
   */
  get(): T {

    if (isUndefined(this.value)) {
      throw new NoSuchElementError("Value is not present.");
    }
    return this.value;
  }

  /**
   * If a value is present, invoke the specified {@code consumer} with the value, otherwise do nothing.
   *
   * @param {(value: T) => void} consumer - lambda to invoke with the value
   */
  async ifPresent(consumer: (value: T) => void): Promise<void> {

    if (!isUndefined(this.value)) {
      await consumer(this.value);
    }
  }

  /**
   * Returns the value if present, otherwise returns {@code other}.
   *
   * @param {T} other - value to returns on non-present value
   *
   * @returns {T} the resulting value
   */
  orElse(other: T): T {

    if (isUndefined(this.value)) {
      return other;
    }
    return this.value;
  }

  /**
   * Returns the value if present, otherwise returns the value given by the {@code other} supplier.
   *
   * @param {() => Promise<T>} other - supplier for the value to return on non-present value
   *
   * @returns {Promise<T>} the resulting value
   */
  async orElseGet(other: () => Promise<T>): Promise<T> {

    if (isUndefined(this.value)) {
      return other();
    }

    return this.value;
  }

  /**
   * Returns the value if present, otherwise throws the error given by the {@code errorSupplier}.
   *
   * @param {() => Error} errorSupplier - supplier for the error tho throw on non-present value
   *
   * @returns {T} the value of present
   */
  orElseThrow(errorSupplier: () => Error): T {

    if (isUndefined(this.value)) {
      throw errorSupplier();
    }

    return this.value;
  }
}
