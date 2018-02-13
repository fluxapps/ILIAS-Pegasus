/**
 * Needs to be executed somewhere during the bootstrap process
 * in order to load the declarations in this module.
 *
 * For tests, call this function before you are loading the tests.
 * e.g. your shim.js
 *
 * For production, call this function in the bootstrap process
 * e.g. your main.ts
 */
export function useStandard(): void {
  console.log("Standard is loaded");
}

// Global declaration, so an import statement is not needed.
declare global {

  /**
   * Calls the specified function {@code block} with 'this' value as thisArg
   * of the apply function {@code Function#apply(thisArg)} and returns its result.
   *
   * @param {T} thisArg - the 'this' value
   * @param {() => R} block - the function to call
   *
   * @returns {R} the result of the called function
   */
  export function withIt<T, R>(thisArg: T, block: () => R): R;

  // extend the Object types
  export interface Object {

    /**
     * Calls the specified function {@code block} with 'this' value as thisArg
     * of the apply function {@code Function#apply(thisArg)} and returns this value.
     *
     * @param {Function} block - the function to call
     * @returns {T} the this value
     */
    applies<T>(block: () => void): T;

    /**
     * Returns `this` value if its satisfies the given {@code predicate} or 'undefined', if it doesn't.
     *
     * @param {(it: T) => boolean} predicate - the condition to return `this` value
     *
     * @returns {T | undefined} `this` value or undefined
     */
    takeIf<T>(predicate: (it: T) => boolean): T | undefined;
  }
}

// implementation for the global declarations

export function withIt<T, R>(thisArg: T, block: () => R): R {
  return block.apply(this);
}

Object.defineProperty(Object.prototype, "applies", {
  value: function <T>(block: Function): T {
    block.apply(this);
    return this;
  },
  writable: true
});

Object.defineProperty(Object.prototype, "takeIf", {
  value: function<T>(predicate: (it: T) => boolean): T | undefined {
    return (predicate(this) ? this : undefined);
  },
  writable: true
});
