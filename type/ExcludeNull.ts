export { ExcludeNull, AssertsExcludeNull };

function ExcludeNull<T>(val: T): Exclude<T, undefined | null> {
    AssertsExcludeNull(val);
    return val;
}

function AssertsExcludeNull<T>(val: T): asserts val is Exclude<T, undefined | null> {
    if (val == undefined) {
        throw new Error("val == undefined");
    }
}
