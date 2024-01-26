import * as util from "./util.js";
import { parseIP } from "./parser.js";
import { Prefix } from "./Prefix.js";
import type { tParseMode, tStringifyMode } from "../types.js";
import { IPSuper } from "../IPSuper.js";

export { IP, IP as IPv4 };

class IP extends IPSuper {
    public override readonly adressFamily = "v4";

    private _address: bigint;
    private _prefix: Prefix;

    constructor(data: { address: bigint, mask: bigint }) {
        super();

        this._address = data.address;
        this._prefix = Prefix.fromBigints(data);
    }

    public static fromString(ipStr: string, mode: tParseMode = "auto"): IP {
        const data = parseIP(ipStr, mode);
        return new IP(data);
    }

    public override getAddress(): bigint {
        return this._address;
    }
    public override getAddressStr(): string {
        return util.bits2OctetStr(this._address);
    }

    public override getPrefix(): Prefix {
        return this._prefix;
    }

    public override getSubnet(prefixLen: number): IP | undefined {
        if (this._prefix.getPrefixLen() > prefixLen) { return; }

        return new IP({ address: this._address, mask: util.prefixNum2Bits(prefixLen) });
    }

    public override equal(n: IP): boolean {
        return this.getAddress() === n.getAddress() && this._prefix.equal(n._prefix);
    }

    public override sameNetwork(n: IP): boolean {
        return this._prefix.equal(n._prefix);
    }

    public override toString(mode: tStringifyMode = "prefix"): string {
        switch (mode) {
            case "subnetMask":
                return this.getAddressStr() + " " + this._prefix.getMaskStr();
            case "wildcardBit":
                return this.getAddressStr() + " " + this._prefix.getWildcardStr();
            case "prefix":
            default:
                return this.getAddressStr() + "/" + this._prefix.getPrefixLenStr();
        }
    }
}
