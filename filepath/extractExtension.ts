export { extractExtension, extractExtensionURL };

function extractExtension(path: string): string | undefined {
    const m = path.match(/(\.[^\.\/]+)$/);

    if (m == null || m[1] == undefined) {
        return undefined;
    }

    return m[1];
}

function extractExtensionURL(url: URL): string | undefined {
    return extractExtension(url.pathname);
}
