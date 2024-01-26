export { arrayBuffer2Hexstring };

function arrayBuffer2Hexstring(buf: ArrayBuffer): string {
    const arr = new Uint8Array(buf);
    const hashHexList: string[] = [];

    for (const octet of arr) {
        hashHexList.push(octet.toString(16));
    }

    return hashHexList.join("");
}
