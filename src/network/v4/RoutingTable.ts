import { Route } from "./Route.js";
import { Prefix } from "./Prefix.js";
import type { RouteMeta } from "./RouteMeta.js";
import { eParseMode } from "../enum.js";

export { RoutingTable, createRoot, tNestRoute };

function createRoot<T extends RouteMeta>(meta: T): RoutingTable<T> {
    return new RoutingTable<T>(new Route<T>(Prefix.fromString("0.0.0.0/0", eParseMode.prefix), meta));
}

class RoutingTable<T extends RouteMeta>{
    private route: Route<T>;
    private redundantRotue: Route<T>[];

    private subTree: RoutingTable<T>[];

    constructor(root: Route<T>) {
        this.route = root;
        this.redundantRotue = [];

        this.subTree = [];
    }

    public addRoute(route: Route<T>): void {
        this._addRoute(route);
    }
    public _addRoute(route: Route<T>): boolean {
        if (this.route.getPrefix().include(route.getPrefix())) {
            if (this.route.equal(route)) {
                console.warn("already exists", route);
                return true;
            }
            if (this.route.sameNetwork(route.getPrefix())) {
                for (const r of this.redundantRotue) {
                    if (r.equal(route)) {
                        console.warn("already exists", route);
                        return true;
                    }
                }
                this.redundantRotue.push(route);
                return true;
            }

            for (const sub of this.subTree) {
                if (sub._addRoute(route)) {
                    return true;
                }
            }

            const grafted: RoutingTable<T>[] = [];
            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (route.getPrefix().include(this.subTree[i]!.route.getPrefix())) {
                    grafted.push(this.subTree.splice(i, 1)[0]!);
                    len--;
                    i--;
                }
            }

            const newTree = new RoutingTable(route);
            for (const g of grafted) {
                newTree.subTree.push(g);
            }

            this.subTree.push(newTree);
            return true;
        }

        return false;
    }

    public addPrefix(network: Prefix, meta: T): void {
        this.addRoute(new Route(network, meta));
    }

    public toArray(): Route<T>[] {
        let arr = [this.route].concat(this.redundantRotue);

        for (const sub of this.subTree) {
            arr = arr.concat(sub.toArray());
        }

        return arr;
    }

    public toNestArray(): tNestRoute<T> {
        const arr: tNestRoute<T> = {
            route: this.route,
            redundantRotue: (<Route<T>[]>[]).concat(this.redundantRotue),
            subRoute: []
        };

        for (const sub of this.subTree) {
            arr.subRoute.push(sub.toNestArray());
        }

        return arr;
    }

    public search(prefix: Prefix): Route<T>[] {
        if (this.route.getPrefix().include(prefix)) {
            let result = [this.route].concat(this.redundantRotue);

            for (const sub of this.subTree) {
                if (sub.route.getPrefix().include(prefix)) {
                    result = result.concat(sub.search(prefix));
                }
            }

            return result;
        }

        return [];
    }

    public searchLongest(prefix: Prefix): Route<T>[] {
        if (this.route.getPrefix().include(prefix)) {
            for (const sub of this.subTree) {
                if (sub.route.getPrefix().include(prefix)) {
                    return sub.searchLongest(prefix);
                }
            }

            return [this.route].concat(this.redundantRotue);
        }

        return [];
    }

    public searchLongerPrefixes(prefix: Prefix): Route<T>[] {
        if (prefix.include(this.route.getPrefix())) {
            let result = [this.route].concat(this.redundantRotue);

            for (const sub of this.subTree) {
                result = result.concat(sub.searchLongerPrefixes(prefix));
            }

            return result;
        } else if (this.route.getPrefix().include(prefix)) {
            let result: Route<T>[] = [];

            for (const sub of this.subTree) {
                result = result.concat(sub.searchLongerPrefixes(prefix));
            }

            return result;
        }

        return [];
    }

    public removeRoute(route: Route<T>): RoutingTable<T>[] {
        if (this.route.sameNetwork(route.getPrefix())) {
            if (this.route.equal(route)) {
                if (this.redundantRotue.length > 0) {
                    this.route = this.redundantRotue.splice(0, 1)[0]!;
                    return [this];
                }

                return this.subTree;
            }

            for (let i = 0, len = this.redundantRotue.length; i < len; i++) {
                if (this.redundantRotue[i]!.equal(route)) {
                    this.redundantRotue.splice(i, 1);
                    break;
                }
            }
            return [this];
        }

        let tmpSubTree: RoutingTable<T>[] = [];
        for (const sub of this.subTree) {
            tmpSubTree = tmpSubTree.concat(sub.removeRoute(route));
        }
        this.subTree = tmpSubTree;

        return [this];
    }

    public sort(): void {
        for (const sub of this.subTree) {
            sub.sort();
        }

        this.subTree.sort((a, b) => {
            const aAdd = a.route.getPrefix().getNetworkAddress();
            const bAdd = b.route.getPrefix().getNetworkAddress();

            if (aAdd < bAdd) {
                return -1;
            }

            if (aAdd > bAdd) {
                return 1;
            }

            return 0;
        });
    }

    public show(): void {
        console.group(this.route.toString());
        console.group("redundant");
        this.redundantRotue.forEach((r) => {
            console.log(r.toString());
        });
        console.groupEnd();
        this.subTree.forEach((t) => {
            t.show();
        });
        console.groupEnd();
    }
}

type tNestRoute<T extends RouteMeta> = {
    route: Route<T>,
    redundantRotue: Route<T>[],
    subRoute: tNestRoute<T>[]
};
