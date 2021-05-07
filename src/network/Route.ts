import { Prefix } from "./Prefix.js";
import { RouteMeta } from "./RouteMeta.js";

export { Route };

class Route<T extends RouteMeta> {
    private _prefix: Prefix;
    private _meta: T;

    constructor(network: Prefix, meta: T) {
        if (network?.isValid()) {
            this._prefix = network;
            this._meta = meta;
        } else {
            console.error("invalid value : ", network, meta);

            this._prefix = undefined;
            this._meta = undefined;
        }
    }

    public isValid(): boolean {
        return !!(this._prefix?.isValid() && this._meta != undefined);
    }

    public equal(r: Route<T>): boolean {
        return this.isValid() && r.isValid() && this.sameNetwork(r._prefix) && this._meta.equal(r._meta);
    }

    public sameNetwork(p: Prefix): boolean {
        return this.isValid() && p.isValid() && this._prefix.equal(p);
    }

    public getPrefix(): Prefix {
        if (!this.isValid()) { return; }

        return this._prefix;
    }

    public getMeta(): T {
        if (!this.isValid()) { return; }

        return this._meta;
    }

    public getCustomOpt(): T {
        console.warn("getCustomOpt is deprecated");
        return this.getMeta();
    }

    public toString(): string {
        if (!this.isValid()) { return; }

        return this._prefix.toString() + " " + this._meta.toString();
    }
}
