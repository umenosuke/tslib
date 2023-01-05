import type { Prefix } from "./Prefix.js";
import type { RouteMeta } from "./RouteMeta.js";

export { Route };

class Route<T extends RouteMeta> {
    private _prefix: Prefix;
    private _meta: T;

    constructor(network: Prefix, meta: T) {
        this._prefix = network;
        this._meta = meta;
    }

    public equal(r: Route<T>): boolean {
        return this.sameNetwork(r._prefix) && this._meta.equal(r._meta);
    }

    public sameNetwork(p: Prefix): boolean {
        return this._prefix.equal(p);
    }

    public getPrefix(): Prefix {
        return this._prefix;
    }

    public getMeta(): T {
        return this._meta;
    }

    public getCustomOpt(): T {
        console.warn("getCustomOpt is deprecated");
        return this.getMeta();
    }

    public toString(): string {
        return this._prefix.toString() + " " + this._meta.toString();
    }
}
