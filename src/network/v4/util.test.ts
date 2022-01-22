import { BITS, octetStr2Bits, bits2OctetStr, bitsReverse, bitsIsLOneRZero, prefixNum2Bits, prefixStr2Bits } from "./util.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    {
        const msgPrefix = "BITS";
        if (BITS !== 4294967295n) {
            const msg = msgPrefix + " => なんか値おかしい「" + BITS.toString(10) + "」";
            errors.push(msg);
        }
        if (BITS !== BigInt(0b11111111111111111111111111111111)) {
            const msg = msgPrefix + " => なんか値おかしい「" + BITS.toString(10) + "」";
            errors.push(msg);
        }
    }
    {
        const msgPrefix = "octetStr2Bits";

        for (const data of <{ input: string }[]>[
            { input: "" },
            { input: "192.168.1.256" },
            { input: "192.168.0.2." },
            { input: "192.168.0.2a" },
            { input: "a" },
            { input: "192.0.2..0" },
            { input: "0.0.0.256" },
            { input: "0.0.256.0" },
            { input: "0.256.0.0" },
            { input: "256.0.0.0" },
        ]) {
            if (octetStr2Bits(data.input) != undefined) {
                const msg = msgPrefix + " => 不正なアドレスでなんか帰ってきてる「" + data.input + "」が「" + octetStr2Bits(data.input) + "」になっている";
                errors.push(msg);
            }
        }

        for (const data of <{ input: string, expect: bigint }[]>[
            { input: "0.0.0.0", expect: 0n },
            { input: "0.0.0.255", expect: 255n },
            { input: "0.0.255.0", expect: 65280n },
            { input: "0.255.0.0", expect: 16711680n },
            { input: "255.0.0.0", expect: 4278190080n },
            { input: "255.255.255.255", expect: 4294967295n },
            { input: "10.0.0.0", expect: 167772160n },
            { input: "10.10.0.0", expect: 168427520n },
            { input: "10.10.10.0", expect: 168430080n },
            { input: "10.10.10.10", expect: 168430090n },
        ]) {
            if (octetStr2Bits(data.input) !== data.expect) {
                const msg = msgPrefix + " => パース失敗っぽい「" + data.input + "」「" + data.expect + "」が「" + octetStr2Bits(data.input) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "bits2OctetStr";

        for (const data of <{ expect: string, input: bigint }[]>[
            { expect: "255.255.255.255", input: -1n },
            { expect: "0.0.0.0", input: 4294967296n },
            { expect: "0.0.0.0", input: 0n },
            { expect: "0.0.0.255", input: 255n },
            { expect: "0.0.255.0", input: 65280n },
            { expect: "0.255.0.0", input: 16711680n },
            { expect: "255.0.0.0", input: 4278190080n },
            { expect: "255.255.255.255", input: 4294967295n },
            { expect: "10.0.0.0", input: 167772160n },
            { expect: "10.10.0.0", input: 168427520n },
            { expect: "10.10.10.0", input: 168430080n },
            { expect: "10.10.10.10", input: 168430090n },
        ]) {
            if (bits2OctetStr(data.input) !== data.expect) {
                const msg = msgPrefix + " => toString失敗っぽい「" + data.expect + "」「" + data.input + "」が「" + bits2OctetStr(data.input) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "bitsReverse";

        for (const data of <{ input: bigint, expect: bigint }[]>[
            { input: BigInt(0b11111111111111111111111111111111), expect: 0n },
            { input: 0n, expect: BigInt(0b11111111111111111111111111111111) },
            { input: -1n, expect: 0n },
            { input: BigInt(0b10101011001110000111101011101101), expect: BigInt(0b01010100110001111000010100010010) },
        ]) {
            if (bitsReverse(data.input) !== data.expect) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input.toString(2) + "」が「" + data.expect.toString(2) + "」じゃなくて「" + bitsReverse(data.input).toString(2) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "bitsIsLOneRZero";

        for (const data of <{ input: bigint, expect: Boolean }[]>[
            { input: BigInt("0b00000000000000000000000000000000"), expect: true },
            { input: BigInt("0b11111111111111111111111111111111"), expect: true },
            { input: BigInt("0b11111111111111110000000000000000"), expect: true },
            { input: BigInt("0b11111111111111110000000100000000"), expect: false },
            { input: BigInt("0b11111111111111110000000000000001"), expect: false },
            { input: BigInt("0b00000000000111111111111111111111"), expect: false },
        ]) {
            if (bitsIsLOneRZero(data.input) !== data.expect) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input.toString(2) + "」が「" + bitsIsLOneRZero(data.input) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "prefixNum2Bits";

        for (const data of <{ input: number, expect: bigint }[]>[
            { input: -1, expect: undefined },
            { input: 0, expect: BigInt(0b00000000000000000000000000000000) },
            { input: 1, expect: BigInt(0b10000000000000000000000000000000) },
            { input: 2, expect: BigInt(0b11000000000000000000000000000000) },
            { input: 3, expect: BigInt(0b11100000000000000000000000000000) },
            { input: 4, expect: BigInt(0b11110000000000000000000000000000) },
            { input: 5, expect: BigInt(0b11111000000000000000000000000000) },
            { input: 6, expect: BigInt(0b11111100000000000000000000000000) },
            { input: 7, expect: BigInt(0b11111110000000000000000000000000) },
            { input: 8, expect: BigInt(0b11111111000000000000000000000000) },
            { input: 9, expect: BigInt(0b11111111100000000000000000000000) },
            { input: 10, expect: BigInt(0b11111111110000000000000000000000) },
            { input: 11, expect: BigInt(0b11111111111000000000000000000000) },
            { input: 12, expect: BigInt(0b11111111111100000000000000000000) },
            { input: 13, expect: BigInt(0b11111111111110000000000000000000) },
            { input: 14, expect: BigInt(0b11111111111111000000000000000000) },
            { input: 15, expect: BigInt(0b11111111111111100000000000000000) },
            { input: 16, expect: BigInt(0b11111111111111110000000000000000) },
            { input: 17, expect: BigInt(0b11111111111111111000000000000000) },
            { input: 18, expect: BigInt(0b11111111111111111100000000000000) },
            { input: 19, expect: BigInt(0b11111111111111111110000000000000) },
            { input: 20, expect: BigInt(0b11111111111111111111000000000000) },
            { input: 21, expect: BigInt(0b11111111111111111111100000000000) },
            { input: 22, expect: BigInt(0b11111111111111111111110000000000) },
            { input: 23, expect: BigInt(0b11111111111111111111111000000000) },
            { input: 24, expect: BigInt(0b11111111111111111111111100000000) },
            { input: 25, expect: BigInt(0b11111111111111111111111110000000) },
            { input: 26, expect: BigInt(0b11111111111111111111111111000000) },
            { input: 27, expect: BigInt(0b11111111111111111111111111100000) },
            { input: 28, expect: BigInt(0b11111111111111111111111111110000) },
            { input: 29, expect: BigInt(0b11111111111111111111111111111000) },
            { input: 30, expect: BigInt(0b11111111111111111111111111111100) },
            { input: 31, expect: BigInt(0b11111111111111111111111111111110) },
            { input: 32, expect: BigInt(0b11111111111111111111111111111111) },
            { input: 33, expect: undefined },
        ]) {
            if (prefixNum2Bits(data.input) !== data.expect) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input + "」が「" + data.expect + "」じゃなく「" + prefixNum2Bits(data.input) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "prefixStr2Bits";

        for (const data of <{ input: string, expect: bigint }[]>[
            { input: "-1", expect: undefined },
            { input: "0", expect: BigInt(0b00000000000000000000000000000000) },
            { input: "1", expect: BigInt(0b10000000000000000000000000000000) },
            { input: "2", expect: BigInt(0b11000000000000000000000000000000) },
            { input: "3", expect: BigInt(0b11100000000000000000000000000000) },
            { input: "4", expect: BigInt(0b11110000000000000000000000000000) },
            { input: "5", expect: BigInt(0b11111000000000000000000000000000) },
            { input: "6", expect: BigInt(0b11111100000000000000000000000000) },
            { input: "7", expect: BigInt(0b11111110000000000000000000000000) },
            { input: "8", expect: BigInt(0b11111111000000000000000000000000) },
            { input: "9", expect: BigInt(0b11111111100000000000000000000000) },
            { input: "10", expect: BigInt(0b11111111110000000000000000000000) },
            { input: "11", expect: BigInt(0b11111111111000000000000000000000) },
            { input: "12", expect: BigInt(0b11111111111100000000000000000000) },
            { input: "13", expect: BigInt(0b11111111111110000000000000000000) },
            { input: "14", expect: BigInt(0b11111111111111000000000000000000) },
            { input: "15", expect: BigInt(0b11111111111111100000000000000000) },
            { input: "16", expect: BigInt(0b11111111111111110000000000000000) },
            { input: "17", expect: BigInt(0b11111111111111111000000000000000) },
            { input: "18", expect: BigInt(0b11111111111111111100000000000000) },
            { input: "19", expect: BigInt(0b11111111111111111110000000000000) },
            { input: "20", expect: BigInt(0b11111111111111111111000000000000) },
            { input: "21", expect: BigInt(0b11111111111111111111100000000000) },
            { input: "22", expect: BigInt(0b11111111111111111111110000000000) },
            { input: "23", expect: BigInt(0b11111111111111111111111000000000) },
            { input: "24", expect: BigInt(0b11111111111111111111111100000000) },
            { input: "25", expect: BigInt(0b11111111111111111111111110000000) },
            { input: "26", expect: BigInt(0b11111111111111111111111111000000) },
            { input: "27", expect: BigInt(0b11111111111111111111111111100000) },
            { input: "28", expect: BigInt(0b11111111111111111111111111110000) },
            { input: "29", expect: BigInt(0b11111111111111111111111111111000) },
            { input: "30", expect: BigInt(0b11111111111111111111111111111100) },
            { input: "31", expect: BigInt(0b11111111111111111111111111111110) },
            { input: "32", expect: BigInt(0b11111111111111111111111111111111) },
            { input: "33", expect: undefined },
            { input: "aaa", expect: undefined },
            { input: "11a", expect: undefined },
            { input: "a11", expect: undefined },
            { input: "1a1", expect: undefined },
        ]) {
            if (prefixStr2Bits(data.input) !== data.expect) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input + "」が「" + data.expect + "」じゃなく「" + prefixStr2Bits(data.input) + "」になっている";
                errors.push(msg);
            }
        }
    }

    return errors;
}
