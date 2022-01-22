export { BITS, BITS_LENGTH, octetStr2Bits, bits2OctetStr, bitsReverse, bitsIsLOneRZero, prefixNum2Bits, prefixStr2Bits };

const BITS: bigint = 4294967295n;
const BITS_LENGTH = 32;

function octetStr2Bits(octetStr: string): bigint {
    if (octetStr == undefined) {
        console.error("invalid value : " + octetStr);
        return;
    }

    const regExp = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
    octetStr = octetStr.trim();

    if (!octetStr.match(regExp)) {
        console.error("invalid value : " + octetStr);
        return;
    }

    const input = octetStr.split(".");
    return BigInt.asUintN(BITS_LENGTH, (BigInt(input[0]) << 24n) + (BigInt(input[1]) << 16n) + (BigInt(input[2]) << 8n) + (BigInt(input[3])));
}

function bits2OctetStr(bi: bigint): string {
    if (bi == undefined) {
        console.error("invalid value : " + bi);
        return;
    }

    return BigInt.asUintN(8, bi >> 24n).toString(10)
        + "." + BigInt.asUintN(8, bi >> 16n).toString(10)
        + "." + BigInt.asUintN(8, bi >> 8n).toString(10)
        + "." + BigInt.asUintN(8, bi).toString(10);
}

function bitsReverse(bi: bigint): bigint {
    if (bi == undefined) {
        console.error("invalid value : " + bi);
        return;
    }

    return BigInt.asUintN(BITS_LENGTH, ~bi);
}

function bitsIsLOneRZero(bi: bigint): boolean {
    if (bi == undefined) {
        console.error("invalid value : " + bi);
        return;
    }

    for (let i = 0n; i < BigInt(BITS_LENGTH); i++) {
        if ((bi & (1n << i)) !== 0n) {
            for (; i < BigInt(BITS_LENGTH); i++) {
                if ((bi & (1n << i)) === 0n) {
                    return false;
                }
            }
        }
    }

    return true;
}

function prefixNum2Bits(prefixLen: number): bigint {
    if (prefixLen == undefined) {
        console.error("invalid value : " + prefixLen);
        return;
    }

    if (prefixLen < 0 || BITS_LENGTH < prefixLen) {
        console.error("invalid value : " + prefixLen);
        return;
    }
    const input = BigInt(BITS_LENGTH) - BigInt(prefixLen);
    return BigInt.asUintN(BITS_LENGTH, (BITS >> input) << input);
}

function prefixStr2Bits(prefixLenStr: string): bigint {
    if (prefixLenStr == undefined) {
        console.error("invalid value : " + prefixLenStr);
        return;
    }

    const regExp = /^([1-2]?[0-9]|3[0-2])$/
    prefixLenStr = prefixLenStr.trim();

    if (!prefixLenStr.match(regExp)) {
        console.error("invalid value : " + prefixLenStr);
        return;
    }

    const input = BigInt(BITS_LENGTH) - BigInt(prefixLenStr);
    return BigInt.asUintN(BITS_LENGTH, (BITS >> input) << input);
}