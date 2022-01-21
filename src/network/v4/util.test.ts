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

        for (const data of <{ str: string }[]>[
            { str: "" },
            { str: "192.168.1.256" },
            { str: "192.168.0.2." },
            { str: "192.168.0.2a" },
            { str: "a" },
            { str: "192.0.2..0" },
            { str: "0.0.0.256" },
            { str: "0.0.256.0" },
            { str: "0.256.0.0" },
            { str: "256.0.0.0" },
        ]) {
            if (octetStr2Bits(data.str) != undefined) {
                const msg = msgPrefix + " => 不正なアドレスでなんか帰ってきてる「" + data.str + "」が「" + octetStr2Bits(data.str) + "」になっている";
                errors.push(msg);
            }
        }

        for (const data of <{ str: string, bit: bigint }[]>[
            { str: "0.0.0.0", bit: 0n },
            { str: "0.0.0.255", bit: 255n },
            { str: "0.0.255.0", bit: 65280n },
            { str: "0.255.0.0", bit: 16711680n },
            { str: "255.0.0.0", bit: 4278190080n },
            { str: "255.255.255.255", bit: 4294967295n },
            { str: "10.0.0.0", bit: 167772160n },
            { str: "10.10.0.0", bit: 168427520n },
            { str: "10.10.10.0", bit: 168430080n },
            { str: "10.10.10.10", bit: 168430090n },
        ]) {
            if (octetStr2Bits(data.str) !== data.bit) {
                const msg = msgPrefix + " => パース失敗っぽい「" + data.str + "」「" + data.bit + "」が「" + octetStr2Bits(data.str) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "bits2OctetStr";

        for (const data of <{ str: string, bit: bigint }[]>[
            { str: "255.255.255.255", bit: -1n },
            { str: "0.0.0.0", bit: 4294967296n },
            { str: "0.0.0.0", bit: 0n },
            { str: "0.0.0.255", bit: 255n },
            { str: "0.0.255.0", bit: 65280n },
            { str: "0.255.0.0", bit: 16711680n },
            { str: "255.0.0.0", bit: 4278190080n },
            { str: "255.255.255.255", bit: 4294967295n },
            { str: "10.0.0.0", bit: 167772160n },
            { str: "10.10.0.0", bit: 168427520n },
            { str: "10.10.10.0", bit: 168430080n },
            { str: "10.10.10.10", bit: 168430090n },
        ]) {
            if (bits2OctetStr(data.bit) !== data.str) {
                const msg = msgPrefix + " => toString失敗っぽい「" + data.str + "」「" + data.bit + "」が「" + bits2OctetStr(data.bit) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "bitsReverse";

        for (const data of <{ in: bigint, out: bigint }[]>[
            { in: BigInt(0b11111111111111111111111111111111), out: 0n },
            { in: 0n, out: BigInt(0b11111111111111111111111111111111) },
            { in: -1n, out: 0n },
            { in: BigInt(0b10101011001110000111101011101101), out: BigInt(0b01010100110001111000010100010010) },
        ]) {
            if (bitsReverse(data.in) !== data.out) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.in.toString(2) + "」が「" + data.out.toString(2) + "」じゃなくて「" + bitsReverse(data.in).toString(2) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "bitsIsLOneRZero";

        for (const data of <{ in: bigint, out: Boolean }[]>[
            { in: BigInt("0b00000000000000000000000000000000"), out: true },
            { in: BigInt("0b11111111111111111111111111111111"), out: true },
            { in: BigInt("0b11111111111111110000000000000000"), out: true },
            { in: BigInt("0b11111111111111110000000100000000"), out: false },
            { in: BigInt("0b11111111111111110000000000000001"), out: false },
            { in: BigInt("0b00000000000111111111111111111111"), out: false },
        ]) {
            if (bitsIsLOneRZero(data.in) !== data.out) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.in.toString(2) + "」が「" + bitsIsLOneRZero(data.in) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "prefixNum2Bits";

        for (const data of <{ in: number, out: bigint }[]>[
            { in: -1, out: undefined },
            { in: 0, out: BigInt(0b00000000000000000000000000000000) },
            { in: 1, out: BigInt(0b10000000000000000000000000000000) },
            { in: 2, out: BigInt(0b11000000000000000000000000000000) },
            { in: 3, out: BigInt(0b11100000000000000000000000000000) },
            { in: 4, out: BigInt(0b11110000000000000000000000000000) },
            { in: 5, out: BigInt(0b11111000000000000000000000000000) },
            { in: 6, out: BigInt(0b11111100000000000000000000000000) },
            { in: 7, out: BigInt(0b11111110000000000000000000000000) },
            { in: 8, out: BigInt(0b11111111000000000000000000000000) },
            { in: 9, out: BigInt(0b11111111100000000000000000000000) },
            { in: 10, out: BigInt(0b11111111110000000000000000000000) },
            { in: 11, out: BigInt(0b11111111111000000000000000000000) },
            { in: 12, out: BigInt(0b11111111111100000000000000000000) },
            { in: 13, out: BigInt(0b11111111111110000000000000000000) },
            { in: 14, out: BigInt(0b11111111111111000000000000000000) },
            { in: 15, out: BigInt(0b11111111111111100000000000000000) },
            { in: 16, out: BigInt(0b11111111111111110000000000000000) },
            { in: 17, out: BigInt(0b11111111111111111000000000000000) },
            { in: 18, out: BigInt(0b11111111111111111100000000000000) },
            { in: 19, out: BigInt(0b11111111111111111110000000000000) },
            { in: 20, out: BigInt(0b11111111111111111111000000000000) },
            { in: 21, out: BigInt(0b11111111111111111111100000000000) },
            { in: 22, out: BigInt(0b11111111111111111111110000000000) },
            { in: 23, out: BigInt(0b11111111111111111111111000000000) },
            { in: 24, out: BigInt(0b11111111111111111111111100000000) },
            { in: 25, out: BigInt(0b11111111111111111111111110000000) },
            { in: 26, out: BigInt(0b11111111111111111111111111000000) },
            { in: 27, out: BigInt(0b11111111111111111111111111100000) },
            { in: 28, out: BigInt(0b11111111111111111111111111110000) },
            { in: 29, out: BigInt(0b11111111111111111111111111111000) },
            { in: 30, out: BigInt(0b11111111111111111111111111111100) },
            { in: 31, out: BigInt(0b11111111111111111111111111111110) },
            { in: 32, out: BigInt(0b11111111111111111111111111111111) },
            { in: 33, out: undefined },
        ]) {
            if (prefixNum2Bits(data.in) !== data.out) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.in + "」が「" + data.out + "」じゃなく「" + prefixNum2Bits(data.in) + "」になっている";
                errors.push(msg);
            }
        }
    }

    {
        const msgPrefix = "prefixStr2Bits";

        for (const data of <{ in: string, out: bigint }[]>[
            { in: "-1", out: undefined },
            { in: "0", out: BigInt(0b00000000000000000000000000000000) },
            { in: "1", out: BigInt(0b10000000000000000000000000000000) },
            { in: "2", out: BigInt(0b11000000000000000000000000000000) },
            { in: "3", out: BigInt(0b11100000000000000000000000000000) },
            { in: "4", out: BigInt(0b11110000000000000000000000000000) },
            { in: "5", out: BigInt(0b11111000000000000000000000000000) },
            { in: "6", out: BigInt(0b11111100000000000000000000000000) },
            { in: "7", out: BigInt(0b11111110000000000000000000000000) },
            { in: "8", out: BigInt(0b11111111000000000000000000000000) },
            { in: "9", out: BigInt(0b11111111100000000000000000000000) },
            { in: "10", out: BigInt(0b11111111110000000000000000000000) },
            { in: "11", out: BigInt(0b11111111111000000000000000000000) },
            { in: "12", out: BigInt(0b11111111111100000000000000000000) },
            { in: "13", out: BigInt(0b11111111111110000000000000000000) },
            { in: "14", out: BigInt(0b11111111111111000000000000000000) },
            { in: "15", out: BigInt(0b11111111111111100000000000000000) },
            { in: "16", out: BigInt(0b11111111111111110000000000000000) },
            { in: "17", out: BigInt(0b11111111111111111000000000000000) },
            { in: "18", out: BigInt(0b11111111111111111100000000000000) },
            { in: "19", out: BigInt(0b11111111111111111110000000000000) },
            { in: "20", out: BigInt(0b11111111111111111111000000000000) },
            { in: "21", out: BigInt(0b11111111111111111111100000000000) },
            { in: "22", out: BigInt(0b11111111111111111111110000000000) },
            { in: "23", out: BigInt(0b11111111111111111111111000000000) },
            { in: "24", out: BigInt(0b11111111111111111111111100000000) },
            { in: "25", out: BigInt(0b11111111111111111111111110000000) },
            { in: "26", out: BigInt(0b11111111111111111111111111000000) },
            { in: "27", out: BigInt(0b11111111111111111111111111100000) },
            { in: "28", out: BigInt(0b11111111111111111111111111110000) },
            { in: "29", out: BigInt(0b11111111111111111111111111111000) },
            { in: "30", out: BigInt(0b11111111111111111111111111111100) },
            { in: "31", out: BigInt(0b11111111111111111111111111111110) },
            { in: "32", out: BigInt(0b11111111111111111111111111111111) },
            { in: "33", out: undefined },
            { in: "aaa", out: undefined },
            { in: "11a", out: undefined },
            { in: "a11", out: undefined },
            { in: "1a1", out: undefined },
        ]) {
            if (prefixStr2Bits(data.in) !== data.out) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.in + "」が「" + data.out + "」じゃなく「" + prefixStr2Bits(data.in) + "」になっている";
                errors.push(msg);
            }
        }
    }

    return errors;
}
