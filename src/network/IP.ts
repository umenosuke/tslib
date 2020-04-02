import * as network from "network.js";

export { IP };

class IP {
    private address: bigint;
    private mask: bigint;

    constructor() {
        this.address = undefined;
        this.mask = undefined;
    }

    public setIPwithMask(ipStr: string) {
        this.address = undefined;
        this.mask = undefined;

        const regExp = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]) +(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
        ipStr = ipStr.trim();

        if (!ipStr.match(regExp)) {
            console.error("invalid value : " + ipStr);
            return;
        }

        const input = ipStr.split(" ");
        this.address = network.octetStr2BigInt(input[0]);
        const tempMask = network.octetStr2BigInt(input[1]);
        if ((((~(tempMask) & network.BITS) + 1n) % 2n) === 0n) {
            this.mask = tempMask;
        } else {
            console.error("invalid value : " + ipStr);
            this.address = undefined;
            this.mask = undefined;
            return;
        }
    }

    public setIPwithPrefix(ipStr: string) {
        this.address = undefined;
        this.mask = undefined;

        const regExp = /^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([1-2]?[0-9]|3[0-2])$/
        ipStr = ipStr.trim();

        if (!ipStr.match(regExp)) {
            console.error("invalid value : " + ipStr);
            return;
        }

        const input = ipStr.split("/");
        this.address = network.octetStr2BigInt(input[0]);
        this.mask = network.prefixStr2BigInt(input[1]);
    }

    public isValid(): boolean {
        return this.address != undefined && this.mask != undefined;
    }

    public getAddress(): bigint {
        if (!this.isValid()) { return; }

        return this.address;
    }
    public getAddressStr(): string {
        if (!this.isValid()) { return; }

        return network.bigInt2OctetStr(this.address);
    }

    public getMask(): bigint {
        if (!this.isValid()) { return; }

        return this.mask;
    }
    public getMaskStr(): string {
        if (!this.isValid()) { return; }

        return network.bigInt2OctetStr(this.mask);
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

        return network.bigInt2OctetStr(this.getNetworkAddress());
    }

    public getBroadcastAddress(): bigint {
        if (!this.isValid()) { return; }

        return BigInt.asUintN(32, (this.address & this.mask) + BigInt.asUintN(32, ~this.mask));
    }
    public getBroadcastAddressStr(): string {
        if (!this.isValid()) { return; }

        return network.bigInt2OctetStr(this.getBroadcastAddress());
    }

    public getAddressNum(): number {
        if (!this.isValid()) { return; }

        return Number(BigInt.asUintN(32, ~this.mask)) + 1;
    }
}
