/**
 * Base interface of all the specific builder interfaces in ILIAS.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface Builder<T> {
  build(): T;
}
