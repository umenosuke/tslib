import type { tParseMode } from "../types.js";
import * as util from "./util.js";

export { parseIP };

function parseIP(ipStr: string, mode: tParseMode): { address: bigint, mask: bigint } {
    const res = subParseIP(ipStr, mode);

    if (res.address == undefined || res.mask == undefined) {
        throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
    }

    return res;
}

function subParseIP(ipStr: string, mode: tParseMode): { address: bigint, mask: bigint } {
    ipStr = ipStr.trim();

    if (mode === "auto" || mode === "host") {
        const regExpAddress = /^[^ \/]+$/
        if (ipStr.match(regExpAddress)) {
            return { address: util.hextetStr2Bits(ipStr), mask: util.BITS };
        }
    }

    if (mode === "auto" || mode === "subnetMask" || mode === "wildcardBit") {
        const regExpAddressWithMask = /^[^ \/]+ +[^ \/]+$/
        if (ipStr.match(regExpAddressWithMask)) {
            const input = ipStr.split(/ +/);

            const tempMask = util.hextetStr2Bits(input[1]!);
            if ((mode === "auto" || mode === "subnetMask") && util.bitsIsLOneRZero(tempMask)) {
                return { address: util.hextetStr2Bits(input[0]!), mask: tempMask };
            } else if ((mode === "auto" || mode === "wildcardBit") && util.bitsIsLOneRZero(util.bitsReverse(tempMask))) {
                return { address: util.hextetStr2Bits(input[0]!), mask: util.bitsReverse(tempMask) };
            }
        }
    }

    if (mode === "auto" || mode === "prefix") {
        const regExpAddressWithPrefix = /^[^ \/]+\/[0-9]{1,3}$/
        if (ipStr.match(regExpAddressWithPrefix)) {
            const input = ipStr.split("/");
            return { address: util.hextetStr2Bits(input[0]!), mask: util.prefixStr2Bits(input[1]!) };
        }
    }

    throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
}
