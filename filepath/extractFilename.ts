export { extractFilename, extractFilenameURL };

function extractFilename(path: string): string | undefined {
    const m = path.match(/\/?([^\/]+)$/);

    if (m == null || m[1] == undefined) {
        return undefined;
    }

    return m[1];
}
function extractFilenameURL(url: URL): string | undefined {
    return extractFilename(url.pathname);
}
