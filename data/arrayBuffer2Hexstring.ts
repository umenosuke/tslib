export { arrayBuffer2Hexstring };

function arrayBuffer2Hexstring(buf: ArrayBuffer): string {
    const arr = new Uint8Array(buf);
    const hexStrList: string[] = [];

    for (const octet of arr) {
        hexStrList.push(octet.toString(16).padStart(2, "0"));
    }

    return hexStrList.join("");
}
