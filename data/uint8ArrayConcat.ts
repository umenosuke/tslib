export { uint8ArrayConcat };

function uint8ArrayConcat(arrList: Uint8Array[]): Uint8Array {
    let sumLen = 0;
    for (const arr of arrList) {
        sumLen += arr.byteLength;
    }

    const resArr = new Uint8Array(sumLen);

    let pos = 0;
    for (const arr of arrList) {
        resArr.set(arr, pos);
        pos += arr.byteLength;
    }

    return resArr;
}
