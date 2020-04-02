export { cloneProperty };

function cloneProperty<T>(source: T): T {
    return JSON.parse(JSON.stringify(source));
}
