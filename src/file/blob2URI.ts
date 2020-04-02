export { blob2URI, revokeURI };

function blob2URI(data: Blob): Promise<string> {
    return new Promise((resolve) => {
        if (!!window.URL) {
            resolve(URL.createObjectURL(data));
        } else {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                resolve(reader.result.toString());
            })
            reader.readAsDataURL(data);
        }
    });
}

function revokeURI(url: string): void {
    if (!!window.URL) {
        URL.revokeObjectURL(url);
    }
}
