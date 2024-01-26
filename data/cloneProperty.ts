export { cloneProperty };

function cloneProperty(source: any): any {
    return JSON.parse(JSON.stringify(source));
}
