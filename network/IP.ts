import type { IPSuper } from "./IPSuper.js";
import type { tParseMode } from "./types.js";
import { IPv4 } from "./v4/IP.js";
import { IPv6 } from "./v6/IP.js";

export { IP };

class IP {
    private constructor() { }

    public static fromString(ipStr: string, mode: tParseMode = "auto"): IPSuper {
        try {
            const ipv4 = IPv4.fromString(ipStr);
            return ipv4;
        } catch (e) {
            try {
                const ipv6 = IPv6.fromString(ipStr)
                return ipv6;
            } catch (e) {
                throw new Error("invalid value [mode=" + mode + "] : " + ipStr);
            }
        }
    }
}
