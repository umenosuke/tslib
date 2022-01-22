import { eParseMode } from "../enum.js";
import { parseIP } from "./parser.js";
import { BITS } from "./util.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    {
        const msgPrefix = "prefixNum2Bits";

        function equalData(a: { address: bigint, mask: bigint }, b: { address: bigint, mask: bigint }) {
            return a.address === b.address && a.mask === b.mask;
        }

        for (const data of <{ input: { str: string, mode: eParseMode }, expect: { address: bigint, mask: bigint } }[]>[
            { input: { str: null, mode: eParseMode.auto }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: null }, expect: { address: undefined, mask: undefined } },
            { input: { str: undefined, mode: eParseMode.auto }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: undefined }, expect: { address: undefined, mask: undefined } },

            { input: { str: "a:::", mode: eParseMode.auto }, expect: { address: undefined, mask: BITS } },
            { input: { str: "a:::", mode: eParseMode.empty }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: eParseMode.host }, expect: { address: undefined, mask: BITS } },
            { input: { str: "a:::", mode: eParseMode.prefix }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: eParseMode.subnetMask }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: eParseMode.wildcardBit }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::", mode: eParseMode.auto }, expect: { address: undefined, mask: BITS } },
            { input: { str: "z:::", mode: eParseMode.empty }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: eParseMode.host }, expect: { address: undefined, mask: BITS } },
            { input: { str: "z:::", mode: eParseMode.prefix }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: eParseMode.subnetMask }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: eParseMode.wildcardBit }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::", mode: eParseMode.auto }, expect: { address: undefined, mask: BITS } },
            { input: { str: ":::", mode: eParseMode.empty }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: eParseMode.host }, expect: { address: undefined, mask: BITS } },
            { input: { str: ":::", mode: eParseMode.prefix }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: eParseMode.subnetMask }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: eParseMode.wildcardBit }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::", mode: eParseMode.auto }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::", mode: eParseMode.empty }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: eParseMode.host }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::", mode: eParseMode.prefix }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: eParseMode.subnetMask }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: eParseMode.wildcardBit }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: eParseMode.auto }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: eParseMode.empty }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: eParseMode.host }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: eParseMode.prefix }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: eParseMode.subnetMask }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: eParseMode.wildcardBit }, expect: { address: undefined, mask: undefined } },
        ]) {
            const check = parseIP(data.input?.str, data.input?.mode);
            if (!equalData(check, data.expect)) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input.str + ", " + data.input.mode + "」が「" + data.expect.address + ", " + data.expect.mask + "」じゃなく「" + check.address + ", " + check.mask + "」になっている";
                errors.push(msg);
            }
        }
    }

    return errors;
}
