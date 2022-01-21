import { octetStr2Bits } from "../v4/util.js";

export { BITS, normalizeHextetStr, hextetStr2Bits, bits2HextetStr, bitsReverse, prefixNum2Bits, prefixStr2Bits };

const BITS: bigint = 340282366920938463463374607431768211455n;

function normalizeHextetStr(hextetStr: string): string {
    const regExpHextet = /^[0-9a-f]{1,4}$/

    const inHextetList = hextetStr.trim().toLowerCase().split("::");
    if (inHextetList.length > 2) {
        console.error("invalid value : " + hextetStr);
        return;
    }

    const tempHextetStrListLeft: string[] = [];
    if (inHextetList[0] !== "") {
        for (const hextet of inHextetList[0].split(":")) {
            if (hextet === "") {
                console.error("invalid value : " + hextetStr);
                return;
            } else if (!hextet.match(regExpHextet)) {
                const bits = octetStr2Bits(hextet);
                if (bits == undefined) {
                    console.error("invalid value : " + hextetStr);
                    return;
                }

                tempHextetStrListLeft.push(BigInt.asUintN(16, bits >> 16n).toString(16));
                tempHextetStrListLeft.push(BigInt.asUintN(16, bits).toString(16));
            } else {
                tempHextetStrListLeft.push(hextet);
            }
        }
    }
    if (inHextetList.length === 1 && tempHextetStrListLeft.length !== 8) {
        console.error("invalid value : " + hextetStr);
        return;
    }

    const tempHextetStrListRight: string[] = [];
    if (inHextetList[1] != undefined && inHextetList[1] !== "") {
        for (const hextet of inHextetList[1].split(":")) {
            if (hextet === "") {
                console.error("invalid value : " + hextetStr);
                return;
            } else if (!hextet.match(regExpHextet)) {
                const bits = octetStr2Bits(hextet);
                if (bits == undefined) {
                    console.error("invalid value : " + hextetStr);
                    return;
                }

                tempHextetStrListRight.push(BigInt.asUintN(16, bits >> 16n).toString(16));
                tempHextetStrListRight.push(BigInt.asUintN(16, bits).toString(16));
            } else {
                tempHextetStrListRight.push(hextet);
            }
        }
    }

    if (inHextetList.length === 1 && (tempHextetStrListLeft.length + tempHextetStrListRight.length) > 8) {
        console.error("invalid value : " + hextetStr);
        return;
    } else if (inHextetList.length === 2 && (tempHextetStrListLeft.length + tempHextetStrListRight.length) > 7) {
        console.error("invalid value : " + hextetStr);
        return;
    }


    const outHextetStrList: string[] = [];

    outHextetStrList.push(...tempHextetStrListLeft);
    for (let i = (tempHextetStrListLeft.length + tempHextetStrListRight.length); i < 8; i++) {
        outHextetStrList.push("0");
    }
    outHextetStrList.push(...tempHextetStrListRight);

    if (outHextetStrList.length !== 8) {
        console.error("invalid value : " + hextetStr);
        return;
    }

    return outHextetStrList.join(":");
}

function hextetStr2Bits(hextetStr: string): bigint {
    const normalizedHextetStr = normalizeHextetStr(hextetStr);
    if (normalizedHextetStr == undefined) {
        console.error("invalid value : " + hextetStr);
        return;
    }

    let bits: bigint = 0n;
    for (const hextet of normalizedHextetStr.split(":")) {
        bits = (bits << 16n) + BigInt("0x" + hextet);
    }
    return BigInt.asUintN(128, bits);
}

function bits2HextetStr(bi: bigint): string {
    return BigInt.asUintN(16, bi >> 112n).toString(16)
        + ":" + BigInt.asUintN(16, bi >> 96n).toString(16)
        + ":" + BigInt.asUintN(16, bi >> 80n).toString(16)
        + ":" + BigInt.asUintN(16, bi >> 64n).toString(16)
        + ":" + BigInt.asUintN(16, bi >> 48n).toString(16)
        + ":" + BigInt.asUintN(16, bi >> 32n).toString(16)
        + ":" + BigInt.asUintN(16, bi >> 16n).toString(16)
        + ":" + BigInt.asUintN(16, bi).toString(16);
}

function bitsReverse(bi: bigint): bigint {
    return BigInt.asUintN(128, ~bi);
}

function prefixNum2Bits(prefixLen: number): bigint {
    if (prefixLen < 0 || 128 < prefixLen) {
        console.error("invalid value : " + prefixLen);
        return;
    }
    const input = 128n - BigInt(prefixLen);
    return BigInt.asUintN(128, (BITS >> input) << input);
}

function prefixStr2Bits(prefixLenStr: string): bigint {
    const regExp = /^[0-9]{1,3}$/
    prefixLenStr = prefixLenStr.trim();

    if (!prefixLenStr.match(regExp)) {
        console.error("invalid value : " + prefixLenStr);
        return;
    }

    return prefixNum2Bits(Number.parseInt(prefixLenStr));
}
