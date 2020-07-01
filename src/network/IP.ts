import * as util from "./util.js";
import { eParseMode, eStringifyMode, parseIP } from "./parser.js";
import { Prefix } from "./Prefix.js";

export { IP };

class IP {
    private _address: bigint;
    private _prefix: Prefix;

    constructor(ipStr: string, mode: eParseMode = eParseMode.auto) {
        const data = parseIP(ipStr, mode);
        this._address = data.address;
        this._prefix = Prefix.createPrefixFromBigints(data);
    }

    public static createIPFromBigints(data: { address: bigint, mask: bigint }): IP {
        const ip = new IP("", eParseMode.empty);
        ip._address = BigInt.asUintN(32, data.address & data.mask);
        ip._prefix = Prefix.createPrefixFromBigints(data);
        return ip;
    }

    public isValid(): boolean {
        return this._address != undefined && this._prefix.isValid();
    }

    public getAddress(): bigint {
        if (!this.isValid()) { return; }

        return this._address;
    }
    public getAddressStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this._address);
    }

    public getPrefix(): Prefix {
        if (!this.isValid()) { return; }

        return this._prefix;
    }

    public equal(n: IP): boolean {
        return this.isValid() && n.isValid() && this.getAddress() === n.getAddress() && this._prefix.equal(n._prefix);
    }

    public sameNetwork(n: IP): boolean {
        return this.isValid() && n.isValid() && this._prefix.equal(n._prefix);
    }

    public toString(mode: eStringifyMode = eStringifyMode.prefix): string {
        if (!this.isValid()) { return; }

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
