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
        if (data?.address == undefined || data?.mask == undefined) {
            console.error("invalid value : ", data);
            return;
        }
        const ip = new IP("", eParseMode.empty);
        ip._address = data.address;
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

    public getSubnet(prefixLen: number): IP {
        if (!this.isValid()) { return; }
        if (this._prefix.getPrefixLen() > prefixLen) { return; }

        return IP.createIPFromBigints({ address: this._address, mask: util.prefixNum2Bits(prefixLen) });
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
