import { IP } from "./IP.js";
import * as util from "./util.js";

export { Route };

class Route<T extends { equal: (compVal: T) => boolean }> {
    private network: IP;
    private customOpt: T;

    constructor(network: IP, customOpt: T) {
        if (network?.isValid() && network.getAddress() === network.getNetworkAddress()) {
            this.network = network;
            this.customOpt = customOpt;
        } else {
            console.error("invalid value : ", network?.getAddressStr(), network?.getPrefixStr(), customOpt);

            this.network = undefined;
            this.customOpt = undefined;
        }
    }

    public isValid(): boolean {
        return !!(this.network?.isValid() && this.customOpt != undefined);
    }

    public same(r: Route<T>): boolean {
        return this.network.getAddress() === r.network.getAddress() && this.network.getMask() === r.network.getMask();
    }

    public equal(r: Route<T>): boolean {
        return this.same(r) && this.customOpt.equal(r.customOpt);
    }

    public contain(n: IP): boolean {
        if (this.network.getMask() > n.getMask()) {
            return false;
        }

        return this.network.getAddress() === BigInt.asUintN(32, n.getAddress() & this.network.getMask());
    }

    public exact(n: IP): boolean {
        return this.network.equal(n);
    }

    public getAddress(): bigint {
        if (!this.isValid()) { return; }

        return this.network.getAddress();
    }
    public getAddressStr(): string {
        if (!this.isValid()) { return; }

        return this.network.getAddressStr();
    }

    public getMask(): bigint {
        if (!this.isValid()) { return; }

        return this.network.getMask();
    }
    public getMaskStr(): string {
        if (!this.isValid()) { return; }

        return this.network.getMaskStr();
    }

    public getPrefixStr(): string {
        if (!this.isValid()) { return; }

        return this.network.getPrefixStr();
    }

    public getCustomOpt(): T {
        if (!this.isValid()) { return; }

        return this.customOpt;
    }
}