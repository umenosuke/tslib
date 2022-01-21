import * as util from "./v4/util.js";
import { parseIP, eParseMode, eStringifyMode } from "./parser.js";
import { IP } from "./IP.js";

export { Prefix };

class Prefix {
    private _address: bigint;
    private _mask: bigint;

    constructor(ipStr: string, mode: eParseMode = eParseMode.auto) {
        const data = parseIP(ipStr, mode);
        if (data?.address != undefined && data?.mask != undefined) {
            this._address = BigInt.asUintN(32, data.address & data.mask);
            this._mask = data.mask;
        } else {
            this._address = undefined;
            this._mask = undefined;
        }
    }

    public static createPrefixFromBigints(data: { address: bigint, mask: bigint }): Prefix {
        const prefix = new Prefix("", eParseMode.empty);
        if (data?.address != undefined && data?.mask != undefined && util.bitsIsLOneRZero(data.mask)) {
            prefix._address = BigInt.asUintN(32, data.address & data.mask);
            prefix._mask = data.mask;
        }
        return prefix;
    }

    public isValid(): boolean {
        return this._address != undefined && this._mask != undefined;
    }

    public equal(n: Prefix): boolean {
        if (!this.isValid() || !n.isValid()) {
            return false;
        }

        return this._mask === n._mask && this._address === n._address;
    }

    public include(p: Prefix): boolean {
        if (!this.isValid() || !p.isValid()) {
            return false;
        }
        if (this._mask > p._mask) {
            return false;
        }

        return this._address === BigInt.asUintN(32, p._address & this._mask);
    }

    public getNetworkAddress(): bigint {
        if (!this.isValid()) { return; }

        return this._address;
    }
    public getNetworkAddressStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this.getNetworkAddress());
    }

    public getBroadcastAddress(): bigint {
        if (!this.isValid()) { return; }

        return BigInt.asUintN(32, (this._address & this._mask) + BigInt.asUintN(32, ~this._mask));
    }
    public getBroadcastAddressStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this.getBroadcastAddress());
    }

    public getMask(): bigint {
        if (!this.isValid()) { return; }

        return this._mask;
    }
    public getMaskStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this._mask);
    }

    public getWildcard(): bigint {
        if (!this.isValid()) { return; }

        return util.bitsReverse(this._mask);
    }
    public getWildcardStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(util.bitsReverse(this._mask));
    }

    public getPrefixLen(): number {
        if (!this.isValid()) { return; }

        let tmpMask = this._mask;
        let bit = 0;
        for (bit = 0; bit < 32; bit++) {
            if (tmpMask === 0n) {
                break;
            }
            tmpMask = BigInt.asUintN(32, tmpMask << 1n);
        }
        return bit;
    }
    public getPrefixLenStr(): string {
        if (!this.isValid()) { return; }

        return "" + this.getPrefixLen();
    }

    public getAddressNum(): number {
        if (!this.isValid()) { return; }

        return Number(BigInt.asUintN(32, ~this._mask)) + 1;
    }

    public getHosts(range: { seek?: bigint, maxNum?: bigint } = {}): IP[] {
        if (!this.isValid()) { return; }

        const seek = ((range.seek ?? -1n) < 0n) ? 0n : range.seek;
        const maxNum = range.maxNum ?? util.BITS;

        const ips: IP[] = [];

        const firstAddr = this.getNetworkAddress() + 1n;
        const mask = this.getMask();
        for (let i = seek, len = BigInt(this.getAddressNum()) - 2n; i < len && i < (seek + maxNum); i++) {
            ips.push(IP.createIPFromBigints({ address: BigInt.asUintN(32, firstAddr + i), mask: mask }));
        }

        return ips;
    }

    public toString(mode: eStringifyMode = eStringifyMode.prefix): string {
        if (!this.isValid()) { return; }

        switch (mode) {
            case eStringifyMode.subnetMask:
                return this.getNetworkAddressStr() + " " + this.getMaskStr();
            case eStringifyMode.wildcardBit:
                return this.getNetworkAddressStr() + " " + this.getWildcardStr();
            case eStringifyMode.prefix:
            default:
                return this.getNetworkAddressStr() + "/" + this.getPrefixLenStr();
        }
    }

    /*
    public split(prefixLen: number): Prefix[] {
        if (!this.isValid()) { return; }
        if (prefixLen < 0 || 32 < prefixLen) { return; }
        if (this.getPrefixLen() > prefixLen) { return; }

        return [];
    }*/
}
