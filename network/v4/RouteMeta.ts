import type { IP } from "./IP.js";

export type { RouteMeta };
export { RouteMetaEmpty, RouteMetaWithNexthop, RouteMetaWithString };

interface RouteMeta {
    equal(compVal: RouteMeta): boolean;
    toString(): string;
}

const nRouteMetaEmpty: unique symbol = Symbol();
class RouteMetaEmpty implements RouteMeta {
    [nRouteMetaEmpty]!: never;

    constructor() {
    }

    public equal(compVal: RouteMetaEmpty): boolean {
        return true;
    }

    public toString(): string {
        return "";
    }
}

const nRouteMetaWithNexthop: unique symbol = Symbol();
class RouteMetaWithNexthop implements RouteMeta {
    [nRouteMetaWithNexthop]!: never;

    private _nextHop: IP;
    get nextHop(): IP {
        return this._nextHop;
    }

    constructor(nextHop: IP) {
        this._nextHop = nextHop.getSubnet(32)!;
    }

    public equal(compVal: RouteMetaWithNexthop): boolean {
        return this._nextHop.equal(compVal._nextHop);
    }

    public toString(): string {
        return this._nextHop.toString();
    }
}

const nRouteMetaWithString: unique symbol = Symbol();
class RouteMetaWithString implements RouteMeta {
    [nRouteMetaWithString]!: never;

    private _str: string;
    get str(): string {
        return this._str;
    }

    constructor(str: string) {
        this._str = str;
    }

    public equal(compVal: RouteMetaWithString): boolean {
        return this._str === compVal._str;
    }

    public toString(): string {
        return this._str;
    }
}
