export { excludeNull, assertsExcludeNull };

function excludeNull<T>(val: T): Exclude<T, undefined | null> {
    assertsExcludeNull(val);
    return val;
}

function assertsExcludeNull<T>(val: T): asserts val is Exclude<T, undefined | null> {
    if (val == undefined) {
        throw new Error("val == undefined");
    }
}
