import * as util from "./util.js";

export { IP, eParseMode };

enum eParseMode {
    auto = "auto",
    host = "host",
    subnetMask = "subnetMask",
    wildcardBit = "wildcardBit",
    prefix = "prefix"
};

class IP {
    private address: bigint;
    private mask: bigint;

    constructor(ipStr: string, mode: eParseMode = eParseMode.auto) {
        this.address = undefined;
        this.mask = undefined;
        ipStr = ipStr.trim();

        if (mode === eParseMode.auto || mode === eParseMode.host) {
            const regExpAddress = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
            if (ipStr.match(regExpAddress)) {
                this.address = util.octetStr2Bits(ipStr);
                this.mask = util.BITS;

                return;
            }
        }

        if (mode === eParseMode.auto || mode === eParseMode.subnetMask || mode === eParseMode.wildcardBit) {
            const regExpAddressWithMask = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]) +(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
            if (ipStr.match(regExpAddressWithMask)) {
                const input = ipStr.split(/ +/);

                const tempMask = util.octetStr2Bits(input[1]);
                if ((mode === eParseMode.auto || mode === eParseMode.subnetMask) && util.bitsIsLOneRZero(tempMask)) {
                    this.address = util.octetStr2Bits(input[0]);
                    this.mask = tempMask;

                    return;
                } else if ((mode === eParseMode.auto || mode === eParseMode.wildcardBit) && util.bitsIsLOneRZero(util.bitsReverse(tempMask))) {
                    this.address = util.octetStr2Bits(input[0]);
                    this.mask = util.bitsReverse(tempMask);

                    return;
                }
            }
        }

        if (mode === eParseMode.auto || mode === eParseMode.prefix) {
            const regExpAddressWithPrefix = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-2]?[0-9]|3[0-2])$/
            if (ipStr.match(regExpAddressWithPrefix)) {
                const input = ipStr.split("/");

                this.address = util.octetStr2Bits(input[0]);
                this.mask = util.prefixStr2Bits(input[1]);

                return;
            }
        }

        this.address = undefined;
        this.mask = undefined;
        console.error("invalid value [mode=" + mode + "] : " + ipStr);
    }

    public isValid(): boolean {
        return this.address != undefined && this.mask != undefined;
    }

    public equal(n: IP): boolean {
        return this.isValid() && n.isValid() && this.getAddress() === n.getAddress() && this.getMask() === n.getMask();
    }

    public getAddress(): bigint {
        if (!this.isValid()) { return; }

        return this.address;
    }
    public getAddressStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this.address);
    }

    public getMask(): bigint {
        if (!this.isValid()) { return; }

        return this.mask;
    }
    public getMaskStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this.mask);
    }

    public getWildcard(): bigint {
        if (!this.isValid()) { return; }

        return util.bitsReverse(this.mask);
    }
    public getWildcardStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(util.bitsReverse(this.mask));
    }

    public getPrefixStr(): string {
        if (!this.isValid()) { return; }

        let tmpMask = this.mask;
        let bit = 0;
        for (bit = 0; bit < 32; bit++) {
            if (tmpMask === 0n) {
                break;
            }
            tmpMask = BigInt.asUintN(32, tmpMask << 1n);
        }
        return "" + bit;
    }

    public getNetworkAddress(): bigint {
        if (!this.isValid()) { return; }

        return BigInt.asUintN(32, this.address & this.mask);
    }
    public getNetworkAddressStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this.getNetworkAddress());
    }

    public getBroadcastAddress(): bigint {
        if (!this.isValid()) { return; }

        return BigInt.asUintN(32, (this.address & this.mask) + BigInt.asUintN(32, ~this.mask));
    }
    public getBroadcastAddressStr(): string {
        if (!this.isValid()) { return; }

        return util.bits2OctetStr(this.getBroadcastAddress());
    }

    public getAddressNum(): number {
        if (!this.isValid()) { return; }

        return Number(BigInt.asUintN(32, ~this.mask)) + 1;
    }

    public toString(): string {
        if (!this.isValid()) { return; }

        return this.getAddressStr() + "/" + this.getPrefixStr();
    }
}
