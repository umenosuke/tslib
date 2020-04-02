import { IP } from "./IP.js";
import * as util from "./util.js";

export { Route };

class Route {
    private network: IP;
    private nextHop: bigint;

    constructor(network: IP, nextHopStr: string) {
        let tmpNetwork: IP = undefined;
        let tmpNextHop: bigint = undefined;

        if (network.isValid() && network.getAddress() === network.getNetworkAddress()) {
            tmpNetwork = network;
        }

        tmpNextHop = util.octetStr2BigInt(nextHopStr);

        if (tmpNetwork != undefined && tmpNextHop != undefined) {
            this.network = tmpNetwork;
            this.nextHop = tmpNextHop;
        } else {
            this.network = undefined;
            this.nextHop = undefined;
        }
    }

    public isValid(): boolean {
        return !!(this.network?.isValid() && this.nextHop != undefined);
    }

    public same(r: Route): boolean {
        return this.network.getAddress() === r.network.getAddress() && this.network.getMask() === r.network.getMask();
    }

    public equal(r: Route): boolean {
        return this.same(r) && this.nextHop === r.nextHop;
    }

    public contain(n: IP): boolean {
        if (this.network.getMask() > n.getMask()) {
            return false;
        }

        return this.network.getAddress() === BigInt.asUintN(32, n.getAddress() & this.network.getMask());
    }

    public exact(n: IP): boolean {
        return this.network.getAddress() === n.getAddress() && this.network.getMask() === n.getMask();
    }

    public getNetwork(): IP {
        return this.network;
    }

    public getNextHop(): bigint {
        if (!this.isValid()) { return; }

        return this.nextHop;
    }
    public getNextHopStr(): string {
        if (!this.isValid()) { return; }

        return util.bigInt2OctetStr(this.nextHop);
    }
}