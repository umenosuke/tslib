import * as util from "./util.js";
import { parseIP } from "./parser.js";
import { Prefix } from "./Prefix.js";
import { eAddressFamily, eParseMode, eStringifyMode } from "../enum.js";

export { IP };

class IP {
    public readonly adressFamily = eAddressFamily.v6;

    private _address: bigint;
    private _prefix: Prefix;

    constructor(data: { address: bigint, mask: bigint }) {
        this._address = data.address;
        this._prefix = Prefix.fromBigints(data);
    }

    public static fromString(ipStr: string, mode: eParseMode = eParseMode.auto): IP {
        const data = parseIP(ipStr, mode);
        return new IP(data);
    }

    public getAddress(): bigint {
        return this._address;
    }
    public getAddressStr(): string {
        return util.bits2HextetStr(this._address);
    }

    public getPrefix(): Prefix {
        return this._prefix;
    }

    public getSubnet(prefixLen: number): IP | undefined {
        if (this._prefix.getPrefixLen() > prefixLen) { return; }

        return new IP({ address: this._address, mask: util.prefixNum2Bits(prefixLen) });
    }

    public equal(n: IP): boolean {
        return this.getAddress() === n.getAddress() && this._prefix.equal(n._prefix);
    }

    public sameNetwork(n: IP): boolean {
        return this._prefix.equal(n._prefix);
    }

    public toString(mode: eStringifyMode = eStringifyMode.prefix): string {
        switch (mode) {
            case eStringifyMode.subnetMask:
                return this.getAddressStr() + " " + this._prefix.getMaskStr();
            case eStringifyMode.wildcardBit:
                return this.getAddressStr() + " " + this._prefix.getWildcardStr();
            case eStringifyMode.prefix:
            default:
                return this.getAddressStr() + "/" + this._prefix.getPrefixLenStr();
        }
    }
}
