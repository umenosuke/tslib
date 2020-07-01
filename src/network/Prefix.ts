import * as util from "./util.js";
import { parseIP, eParseMode } from "./parser.js";
import { IP } from "./IP.js";

export { Prefix };

class Prefix {
    private _address: bigint;
    private _mask: bigint;

    constructor(ipStr: string, mode: eParseMode) {
        const data = parseIP(ipStr, mode);
        this._address = BigInt.asUintN(32, data.address & data.mask);
        this._mask = data.mask;
    }

    public static createPrefixFromBigints(data: { address: bigint, mask: bigint }): Prefix {
        const prefix = new Prefix("", eParseMode.empty);
        prefix._address = BigInt.asUintN(32, data.address & data.mask);
        prefix._mask = data.mask;
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

    public getHosts(): IP[] {
        if (!this.isValid()) { return; }

        const ips: IP[] = [];

        const netAddr = this.getNetworkAddress();
        const mask = this.getMask();
        for (let i = 1n, len = BigInt(this.getAddressNum()) - 1n; i < len; i++) {
            ips.push(IP.createIPFromBigints({ address: BigInt.asUintN(32, netAddr + i), mask: mask }));
        }

        return ips;
    }
}
