import { eParseMode } from "../enum.js";
import * as util from "./util.js";

export { parseIP };

function parseIP(ipStr: string, mode: eParseMode): { address: bigint, mask: bigint } {
    const res = subParseIP(ipStr, mode);

    if (res.address == undefined || res.mask == undefined) {
        throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
    }

    return res;
}

function subParseIP(ipStr: string, mode: eParseMode): { address: bigint, mask: bigint } {
    ipStr = ipStr.trim();

    if (mode === eParseMode.auto || mode === eParseMode.host) {
        const regExpAddress = /^[^ \/]+$/
        if (ipStr.match(regExpAddress)) {
            return { address: util.hextetStr2Bits(ipStr), mask: util.BITS };
        }
    }

    if (mode === eParseMode.auto || mode === eParseMode.subnetMask || mode === eParseMode.wildcardBit) {
        const regExpAddressWithMask = /^[^ \/]+ +[^ \/]+$/
        if (ipStr.match(regExpAddressWithMask)) {
            const input = ipStr.split(/ +/);

            const tempMask = util.hextetStr2Bits(input[1]!);
            if ((mode === eParseMode.auto || mode === eParseMode.subnetMask) && util.bitsIsLOneRZero(tempMask)) {
                return { address: util.hextetStr2Bits(input[0]!), mask: tempMask };
            } else if ((mode === eParseMode.auto || mode === eParseMode.wildcardBit) && util.bitsIsLOneRZero(util.bitsReverse(tempMask))) {
                return { address: util.hextetStr2Bits(input[0]!), mask: util.bitsReverse(tempMask) };
            }
        }
    }

    if (mode === eParseMode.auto || mode === eParseMode.prefix) {
        const regExpAddressWithPrefix = /^[^ \/]+\/[0-9]{1,3}$/
        if (ipStr.match(regExpAddressWithPrefix)) {
            const input = ipStr.split("/");
            return { address: util.hextetStr2Bits(input[0]!), mask: util.prefixStr2Bits(input[1]!) };
        }
    }

    throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
}
