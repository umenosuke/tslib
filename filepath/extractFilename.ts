export { extractFilename };

function extractFilename(path: string): string {
    const m = path.match(/\/([^\/]+)$/);

    if (m == undefined || m[1] == undefined) {
        return "";
    }

    return m[1];
}
