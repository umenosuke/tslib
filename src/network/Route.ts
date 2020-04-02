import { IP } from "./IP.js";
import * as util from "./util.js";

export { Route };

class Route {
    private network: IP;
    private nextHop: bigint;

    constructor(network: IP, nextHopStr: string) {
        this.network = undefined;
        if (network.isValid()) {
            this.network = network;
        }

        this.nextHop = util.octetStr2BigInt(nextHopStr);
    }

    public isValid(): boolean {
        return !!(this.network?.isValid() && this.nextHop != undefined);
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