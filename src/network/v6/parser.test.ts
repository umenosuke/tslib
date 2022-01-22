import { eParseMode } from "../enum.js";
import { parseIP } from "./parser.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    {
        const msgPrefix = "prefixNum2Bits";

        function checkData(a: { address: bigint, mask: bigint }, b: { address: bigint, mask: bigint }) {
            return a.address === b.address && a.mask === b.mask;
        }

        for (const data of <{ input: { str: string, mode: eParseMode }, expect: { address: bigint, mask: bigint } }[]>[
        ]) {
            const check = parseIP(data.input.str, data.input.mode);
            if (checkData(check, data.expect)) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input + "」が「" + data.expect + "」じゃなく「" + check + "」になっている";
                errors.push(msg);
            }
        }
    }

    return errors;
}
