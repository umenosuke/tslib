import * as util from "./util.js";

export { IP };

class IP {
    private address: bigint;
    private mask: bigint;

    constructor(ipStr: string) {
        this.address = undefined;
        this.mask = undefined;
        ipStr = ipStr.trim();

        const regExpAddress = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        if (ipStr.match(regExpAddress)) {
            this.address = util.octetStr2Bits(ipStr);
            this.mask = util.BITS;

            return;
        }

        const regExpAddressWithMask = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]) +(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        if (ipStr.match(regExpAddressWithMask)) {
            const input = ipStr.split(" ");

            this.address = util.octetStr2Bits(input[0]);
            const tempMask = util.octetStr2Bits(input[1]);
            if ((((~(tempMask) & util.BITS) + 1n) % 2n) === 0n) {
                this.mask = tempMask;
            } else {
                console.error("invalid value : " + ipStr);
                this.address = undefined;
                this.mask = undefined;
                return;
            }

            return;
        }

        const regExpAddressWithPrefix = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-2]?[0-9]|3[0-2])$/
        if (ipStr.match(regExpAddressWithPrefix)) {
            const input = ipStr.split("/");

            this.address = util.octetStr2Bits(input[0]);
            this.mask = util.prefixStr2Bits(input[1]);

            return;
        }

        console.error("invalid value : " + ipStr);
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
