import { IP } from "./IP.js";

export { RouteMetaEmpty, RouteMetaWithNexthop };

declare const nRouteMetaWithNexthop: unique symbol;
class RouteMetaWithNexthop {
    [nRouteMetaWithNexthop]: never;

    private nextHop: IP;

    constructor(nextHop: IP) {
        this.nextHop = nextHop;
    }

    public equal(compVal: RouteMetaWithNexthop): boolean {
        return !!this.nextHop?.equal(compVal.nextHop);
    }

    public toString(): string {
        return this.nextHop?.toString();
    }
}

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
