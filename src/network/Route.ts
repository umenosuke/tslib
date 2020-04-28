import { IP } from "./IP.js";

export { Route };

class Route<T extends { equal(compVal: T): boolean, toString(): string }> {
    private _network: IP;
    private _customOpt: T;

    constructor(network: IP, customOpt: T) {
        if (network?.isValid() && network.getAddress() === network.getNetworkAddress()) {
            this._network = network;
            this._customOpt = customOpt;
        } else {
            console.error("invalid value : ", network?.getAddressStr(), network?.getPrefixStr(), customOpt);

            this._network = undefined;
            this._customOpt = undefined;
        }
    }

    public isValid(): boolean {
        return !!(this._network?.isValid() && this._customOpt != undefined);
    }

    public same(r: Route<T>): boolean {
        return this.isValid() && r.isValid() && this._network.getAddress() === r._network.getAddress() && this._network.getMask() === r._network.getMask();
    }

    public equal(r: Route<T>): boolean {
        return this.isValid() && r.isValid() && this.same(r) && this._customOpt.equal(r._customOpt);
    }

    public include(r: Route<T>): boolean {
        return this.isValid() && r.isValid() && this.contain(r._network);
    }

    public exact(n: IP): boolean {
        return this.isValid() && n.isValid() && this._network.equal(n);
    }

    public contain(n: IP): boolean {
        if (!this.isValid() || !n.isValid()) {
            return false;
        }
        if (this._network.getMask() > n.getMask()) {
            return false;
        }

        return this._network.getAddress() === BigInt.asUintN(32, n.getAddress() & this._network.getMask());
    }

    public getAddress(): bigint {
        if (!this.isValid()) { return; }

        return this._network.getAddress();
    }
    public getAddressStr(): string {
        if (!this.isValid()) { return; }

        return this._network.getAddressStr();
    }

    public getMask(): bigint {
        if (!this.isValid()) { return; }

        return this._network.getMask();
    }
    public getMaskStr(): string {
        if (!this.isValid()) { return; }

        return this._network.getMaskStr();
    }

    public getPrefixStr(): string {
        if (!this.isValid()) { return; }

        return this._network.getPrefixStr();
    }

    public getCustomOpt(): T {
        if (!this.isValid()) { return; }

        return this._customOpt;
    }

    public toString(): string {
        if (!this.isValid()) { return; }

        return this._network.toString() + " " + this._customOpt.toString();
    }
}
