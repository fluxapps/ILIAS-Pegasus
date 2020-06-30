function isFunction(descriptor: PropertyDescriptor): boolean {
    return typeof descriptor.value === "function";
}

function isProperty(descriptor: PropertyDescriptor): boolean {
    return (
        typeof descriptor.get !== "undefined" ||
        typeof descriptor.set !== "undefined" ||
        (typeof descriptor.value !== "symbol" && typeof descriptor.value !== "function")
    );
}

function validatePrototype<T>(ctor: new(...args: Array<unknown>) => T): void {
    if (typeof ctor.prototype === "undefined") {
        throw new Error("Can not mock object with undefined prototype!");
    }
}

export function createSpyObject<T>(ctor: new(...args: Array<unknown>) => T): jasmine.SpyObj<T> {
    const proto: unknown = ctor.prototype;
    validatePrototype(ctor);

    const propertyDescriptors: Array<[string, PropertyDescriptor]> = Object.entries(Object.getOwnPropertyDescriptors(proto));
    const validPropertyNames: ReadonlyArray<string> = propertyDescriptors
        .filter((it) => isProperty(it[1]))
        .map((it) => it[0]);

    const validFunctionNames: ReadonlyArray<string> = propertyDescriptors
        .filter((it) => isFunction(it[1]))
        .map((it) => it[0]);

    return jasmine.createSpyObj(
        ctor.name,
        validFunctionNames,
        validPropertyNames
    );
}
