import * as util from "./util.js";
import { parseIP } from "./parser.js";
import type { tParseMode, tStringifyMode } from "../types.js";
import { IP } from "./IP.js";
import { PrefixSuper } from "../PrefixSuper.js";

export { Prefix, Prefix as PrefixIPv6 };

class Prefix extends PrefixSuper {
    public override readonly adressFamily = "v6";

    private _address: bigint;
    private _mask: bigint;

    private constructor() {
        super();

        this._address = -0n;
        this._mask = -0n;
    }

    public static fromString(ipStr: string, mode: tParseMode = "auto"): Prefix {
        return Prefix.fromBigints(parseIP(ipStr, mode));
    }

    public static fromBigints(data: { address: bigint, mask: bigint }): Prefix {
        const prefix = new Prefix();

        if (util.bitsIsLOneRZero(data.mask)) {
            prefix._address = BigInt.asUintN(util.BITS_LENGTH, data.address & data.mask);
            prefix._mask = data.mask;
        }

        return prefix;
    }

    public equal(n: Prefix): boolean {
        return this._mask === n._mask && this._address === n._address;
    }

    public include(p: Prefix): boolean {
        if (this._mask > p._mask) {
            return false;
        }

        return this._address === BigInt.asUintN(util.BITS_LENGTH, p._address & this._mask);
    }

    public getNetworkAddress(): bigint {
        return this._address;
    }
    public getNetworkAddressStr(): string {
        return util.bits2HextetStr(this.getNetworkAddress());
    }

    public getBroadcastAddress(): bigint {
        return BigInt.asUintN(util.BITS_LENGTH, (this._address & this._mask) + BigInt.asUintN(util.BITS_LENGTH, ~this._mask));
    }
    public getBroadcastAddressStr(): string {
        return util.bits2HextetStr(this.getBroadcastAddress());
    }

    public getMask(): bigint {
        return this._mask;
    }
    public getMaskStr(): string {
        return util.bits2HextetStr(this._mask);
    }

    public getWildcard(): bigint {
        return util.bitsReverse(this._mask);
    }
    public getWildcardStr(): string {
        return util.bits2HextetStr(util.bitsReverse(this._mask));
    }

    public getPrefixLen(): number {
        let tmpMask = this._mask;
        let bit = 0;
        for (bit = 0; bit < util.BITS_LENGTH; bit++) {
            if (tmpMask === 0n) {
                break;
            }
            tmpMask = BigInt.asUintN(util.BITS_LENGTH, tmpMask << 1n);
        }
        return bit;
    }
    public getPrefixLenStr(): string {
        return "" + this.getPrefixLen();
    }

    public getAddressNum(): number {
        return Number(BigInt.asUintN(util.BITS_LENGTH, ~this._mask)) + 1;
    }

    public getHosts(range: { seek?: bigint, maxNum?: bigint } = {}): IP[] {
        const seek = (range.seek == undefined || range.seek < 0n) ? 0n : range.seek;
        const maxNum = range.maxNum ?? util.BITS;

        const ips: IP[] = [];

        const firstAddr = this.getNetworkAddress() + 1n;
        const mask = this.getMask();
        for (let i = seek, len = BigInt(this.getAddressNum()) - 2n; i < len && i < (seek + maxNum); i++) {
            ips.push(new IP({ address: BigInt.asUintN(util.BITS_LENGTH, firstAddr + i), mask: mask }));
        }

        return ips;
    }

    public split(prefixLength: number): Prefix[] {
        if (prefixLength < this.getPrefixLen()) {
            throw new Error("invalid value : " + prefixLength);
        }
        if (prefixLength === this.getPrefixLen()) {
            return [Prefix.fromBigints({ address: this.getNetworkAddress(), mask: this.getMask() })];
        }

        const netmask = util.prefixNum2Bits(prefixLength);

        const shift = BigInt(util.BITS_LENGTH - prefixLength);
        const max = (netmask & util.bitsReverse(this.getMask()));

        const subPrefix: Prefix[] = [];

        for (let sub = 0n; (sub << shift) <= max; sub++) {
            subPrefix.push(Prefix.fromBigints({
                address: this.getNetworkAddress() + (sub << shift),
                mask: netmask
            }));
        }

        return subPrefix;
    }

    public toString(mode: tStringifyMode = "prefix"): string {
        switch (mode) {
            case "subnetMask":
                return this.getNetworkAddressStr() + " " + this.getMaskStr();
            case "wildcardBit":
                return this.getNetworkAddressStr() + " " + this.getWildcardStr();
            case "prefix":
            default:
                return this.getNetworkAddressStr() + "/" + this.getPrefixLenStr();
        }
    }
}
