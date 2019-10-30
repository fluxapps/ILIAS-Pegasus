/**
 * @deprecated use Object#applies instead e.g. new MyType().applies(function(): void {...})
 */
export function apply<T>(it: T, action: (it: T) => void): T {
  action(it);
  return it;
}

/**
 * @deprecated use global withIt instead
 */
export function withIt<T>(it: T, action: (it: T) => void): void {action(it)}

/**
 * checks, whether 'value' is defined
 * @param value
 */
export function isDefined(value: unknown): boolean {
    return typeof value !== "undefined" && value !== null;
}

export function isNullOrUndefined(value: unknown): boolean {
    return !isDefined(value);
}

export function isNumber(value: unknown): boolean {
    return typeof value === "number";
}

export function isObject(value: unknown): boolean {
    return typeof value === "object";
}
export function isString(value: unknown): boolean {
    return typeof value === "string";
}
