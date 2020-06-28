import { Route } from "./Route.js";
import { IP } from "./IP.js";

export { RoutingTable, createRoot };

function createRoot<T extends { equal: (compVal: T) => boolean, toString: () => string }>(customOpt: T): RoutingTable<T> {
    return new RoutingTable<T>(new Route<T>(new IP("0.0.0.0/0"), customOpt));
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
        if (this.route.include(route)) {
            if (this.route.equal(route)) {
                console.warn("already exists", route);
                return true;
            }
            if (this.route.same(route)) {
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
                if (route.include(this.subTree[i].route)) {
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

    public searchRoute(ip: IP): Route<T>[] {
        if (this.route.contain(ip)) {
            let result = [this.route].concat(this.redundantRotue);

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (this.subTree[i].route.contain(ip)) {
                    result = result.concat(this.subTree[i].searchRoute(ip));
                }
            }

            return result;
        }

        return [];
    }

    public searchRouteLongest(ip: IP): Route<T>[] {
        if (this.route.contain(ip)) {
            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (this.subTree[i].route.contain(ip)) {
                    return this.subTree[i].searchRouteLongest(ip);
                }
            }

            return [this.route].concat(this.redundantRotue);
        }

        return [];
    }

    public searchRouteLongerPrefixes(route: Route<T>): Route<T>[] {
        if (route.include(this.route)) {
            let result = [this.route].concat(this.redundantRotue);

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                result = result.concat(this.subTree[i].searchRouteLongerPrefixes(route));
            }

            return result;
        } else if (this.route.include(route)) {
            let result: Route<T>[] = [];

            for (let i = 0, len = this.subTree.length; i < len; i++) {
                result = result.concat(this.subTree[i].searchRouteLongerPrefixes(route));
            }

            return result;
        }

        return [];
    }

    public removeRoute(route: Route<T>): RoutingTable<T>[] {
        if (this.route.same(route)) {
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
            const aAdd = a.route.getAddress();
            const bAdd = b.route.getAddress();

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
