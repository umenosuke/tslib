export { blob2URI, revokeURI };

function blob2URI(data: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!!window.URL) {
            resolve(URL.createObjectURL(data));
        } else {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                if (reader.result != null) {
                    resolve(reader.result.toString());
                } else {
                    reject("data load fail");
                }
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
