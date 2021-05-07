import { IP } from "./IP.js";

export { RouteMetaEmpty, RouteMetaWithNexthop };

declare const nRouteMetaEmpty: unique symbol;
class RouteMetaEmpty {
    [nRouteMetaEmpty]: never;

    constructor() {
    }

    public equal(compVal: RouteMetaEmpty): boolean {
        return true;
    }

    public toString(): string {
        return "";
    }
}

declare const nRouteMetaWithNexthop: unique symbol;
class RouteMetaWithNexthop {
    [nRouteMetaWithNexthop]: never;

    private _nextHop: IP;
    get nextHop(): IP {
        return this._nextHop;
    }

    constructor(nextHop: IP) {
        this._nextHop = nextHop.getSubnet(32);
    }

    public equal(compVal: RouteMetaWithNexthop): boolean {
        return !!this._nextHop?.equal(compVal._nextHop);
    }

    public toString(): string {
        return this._nextHop?.toString();
    }
}