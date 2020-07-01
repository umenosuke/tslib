import { Route } from "./Route.js";
import { IP } from "./IP.js";
import { Prefix } from "./Prefix.js";
import { eParseMode } from "./parser.js";

export { RoutingTable, createRoot };

function createRoot<T extends { equal: (compVal: T) => boolean, toString: () => string }>(customOpt: T): RoutingTable<T> {
    return new RoutingTable<T>(new Route<T>(new Prefix("0.0.0.0/0", eParseMode.prefix), customOpt));
}

class RoutingTable<T extends { equal: (compVal: T) => boolean, toString: () => string }>{
    private route: Route<T>;
    private redundantRotue: Route<T>[];

    private subTree: RoutingTable<T>[];

    constructor(root: Route<T>) {
        this.route = root;
        this.redundantRotue = [];

        this.subTree = [];
    }

    public addRoute(route: Route<T>): boolean {
        if (!route.isValid()) {
            console.warn("route is not valid");
            return true;
        }
        if (this.route.getPrefix().include(route.getPrefix())) {
            if (this.route.equal(route)) {
                console.warn("already exists", route);
                return true;
            }
            if (this.route.sameNetwork(route.getPrefix())) {
                for (let i = 0, len = this.redundantRotue.length; i < len; i++) {
                    const r = this.redundantRotue[i];
                    if (r.equal(route)) {
                        console.warn("already exists", route);
                        return true;
                    }
                }
                this.redundantRotue.push(route);
                return true;
            }

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (this.subTree[i].addRoute(route)) {
                    return true;
                }
            }

            const grafted: RoutingTable<T>[] = [];
            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (route.getPrefix().include(this.subTree[i].route.getPrefix())) {
                    grafted.push(this.subTree.splice(i, 1)[0]);
                    len--;
                    i--;
                }
            }

            const newTree = new RoutingTable(route);
            for (let i = 0, len = grafted.length; i < len; i++) {
                newTree.subTree.push(grafted[i]);
            }

            this.subTree.push(newTree);
            return true;
        }

        return false;
    }

    public toArray(): Route<T>[] {
        let arr = [this.route].concat(this.redundantRotue);

        for (let i = 0, len = this.subTree.length; i < len; i++) {
            arr = arr.concat(this.subTree[i].toArray());
        }

        return arr;
    }

    public search(prefix: Prefix): Route<T>[] {
        if (this.route.getPrefix().include(prefix)) {
            let result = [this.route].concat(this.redundantRotue);

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (this.subTree[i].route.getPrefix().include(prefix)) {
                    result = result.concat(this.subTree[i].search(prefix));
                }
            }

            return result;
        }

        return [];
    }

    public searchLongest(prefix: Prefix): Route<T>[] {
        if (this.route.getPrefix().include(prefix)) {
            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (this.subTree[i].route.getPrefix().include(prefix)) {
                    return this.subTree[i].searchLongest(prefix);
                }
            }

            return [this.route].concat(this.redundantRotue);
        }

        return [];
    }

    public searchLongerPrefixes(prefix: Prefix): Route<T>[] {
        if (prefix.include(this.route.getPrefix())) {
            let result = [this.route].concat(this.redundantRotue);

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                result = result.concat(this.subTree[i].searchLongerPrefixes(prefix));
            }

            return result;
        } else if (this.route.getPrefix().include(prefix)) {
            let result: Route<T>[] = [];

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                result = result.concat(this.subTree[i].searchLongerPrefixes(prefix));
            }

            return result;
        }

        return [];
    }

    public removeRoute(route: Route<T>): RoutingTable<T>[] {
        if (this.route.sameNetwork(route.getPrefix())) {
            if (this.route.equal(route)) {
                if (this.redundantRotue.length > 0) {
                    this.route = this.redundantRotue.splice(0, 1)[0];
                    return [this];
                }

                return this.subTree;
            }

            for (let i = 0, len = this.redundantRotue.length; i < len; i++) {
                if (this.redundantRotue[i].equal(route)) {
                    this.redundantRotue.splice(i, 1);
                    break;
                }
            }
            return [this];
        }

        let tmpSubTree: RoutingTable<T>[] = [];
        for (let i = 0, len = this.subTree.length; i < len; i++) {
            tmpSubTree = tmpSubTree.concat(this.subTree[i].removeRoute(route));
        }
        this.subTree = tmpSubTree;

        return [this];
    }

    public sort(): void {
        for (let i = 0, len = this.subTree.length; i < len; i++) {
            this.subTree[i].sort();
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
