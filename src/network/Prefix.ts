import type { PrefixSuper } from "./PrefixSuper.js";
import type { tParseMode } from "./types.js";
import { PrefixIPv4 } from "./v4/Prefix.js";
import { PrefixIPv6 } from "./v6/Prefix.js";

export { Prefix };

class Prefix {
    private constructor() { }

    public static fromString(ipStr: string, mode: tParseMode = "auto"): PrefixSuper {
        try {
            const ipv4 = PrefixIPv4.fromString(ipStr);
            return ipv4;
        } catch (e) {
            try {
                const ipv6 = PrefixIPv6.fromString(ipStr)
                return ipv6;
            } catch (e) {
                throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
            }
        }
    }
};
