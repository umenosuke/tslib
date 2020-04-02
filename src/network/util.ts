export { BITS, octetStr2BigInt, bigInt2OctetStr, prefixStr2BigInt };

const BITS: bigint = 4294967295n;

function octetStr2BigInt(octetStr: string): bigint {
    const regExp = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
    octetStr = octetStr.trim();

    if (!octetStr.match(regExp)) {
        console.error("invalid value : " + octetStr);
        return;
    }

    const input = octetStr.split(".");
    return BigInt.asUintN(32, (BigInt(input[0]) << 24n) + (BigInt(input[1]) << 16n) + (BigInt(input[2]) << 8n) + (BigInt(input[3])));
}

function bigInt2OctetStr(bi: bigint): string {
    return BigInt.asUintN(8, bi >> 24n).toString(10)
        + "." + BigInt.asUintN(8, bi >> 16n).toString(10)
        + "." + BigInt.asUintN(8, bi >> 8n).toString(10)
        + "." + BigInt.asUintN(8, bi).toString(10);
}

function prefixStr2BigInt(prefixStr: string): bigint {
    const regExp = /^([1-2]?[0-9]|3[0-2])$/
    prefixStr = prefixStr.trim();

    if (!prefixStr.match(regExp)) {
        console.error("invalid value : " + prefixStr);
        return;
    }

    const input = 32n - BigInt(prefixStr);
    return BigInt.asUintN(32, (BITS >> input) << input);
}