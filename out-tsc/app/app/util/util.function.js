/**
 * @deprecated use Object#applies instead e.g. new MyType().applies(function(): void {...})
 */
export function apply(it, action) {
    action(it);
    return it;
}
/**
 * @deprecated use global withIt instead
 */
export function withIt(it, action) { action(it); }
/**
 * checks, whether 'value' is defined
 * @param value
 */
export function isDefined(value) {
    return typeof value !== "undefined" && value !== null;
}
//# sourceMappingURL=util.function.js.map