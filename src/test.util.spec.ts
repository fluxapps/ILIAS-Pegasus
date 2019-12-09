export function createSpyObject<T>(ctor: new(...args: Array<unknown>) => T): jasmine.SpyObj<T> {
    const proto: unknown = ctor.prototype;
    const propertyNames: ReadonlyArray<string> = Object.getOwnPropertyNames(proto);
    return jasmine.createSpyObj(
        ctor.name,
        propertyNames.filter((it) => typeof proto[it] === "function"),
        propertyNames.filter((it) => typeof proto[it] !== "function")
    );
}
