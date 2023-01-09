import { eParseMode } from "../enum.js";
import * as util from "./util.js";

export { parseIP, getEmptyIP };

function getEmptyIP(): { address: undefined, mask: undefined } {
    return { address: undefined, mask: undefined };
}

function parseIP(ipStr: string, mode: eParseMode): { address: bigint, mask: bigint } {
    ipStr = ipStr.trim();

    if (mode === eParseMode.auto || mode === eParseMode.host) {
        const regExpAddress = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        if (ipStr.match(regExpAddress)) {
            return { address: util.octetStr2Bits(ipStr), mask: util.BITS };
        }
    }

    if (mode === eParseMode.auto || mode === eParseMode.subnetMask || mode === eParseMode.wildcardBit) {
        const regExpAddressWithMask = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]) +(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        if (ipStr.match(regExpAddressWithMask)) {
            const input = ipStr.split(/ +/);

            const tempMask = util.octetStr2Bits(input[1]!);
            if ((mode === eParseMode.auto || mode === eParseMode.subnetMask) && util.bitsIsLOneRZero(tempMask)) {
                return { address: util.octetStr2Bits(input[0]!), mask: tempMask };
            } else if ((mode === eParseMode.auto || mode === eParseMode.wildcardBit) && util.bitsIsLOneRZero(util.bitsReverse(tempMask))) {
                return { address: util.octetStr2Bits(input[0]!), mask: util.bitsReverse(tempMask) };
            }
        }
    }

    if (mode === eParseMode.auto || mode === eParseMode.prefix) {
        const regExpAddressWithPrefix = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-2]?[0-9]|3[0-2])$/
        if (ipStr.match(regExpAddressWithPrefix)) {
            const input = ipStr.split("/");
            return { address: util.octetStr2Bits(input[0]!), mask: util.prefixStr2Bits(input[1]!) };
        }
    }

    throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
}
