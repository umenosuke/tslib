import { Route } from "./Route.js";
import { IP } from "./IP.js";

export { RoutingTable };

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
        console.log(this.route.toString(), route.toString(), this.route.include(route));
        if (!route.isValid()) {
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

    public searchRoute(ip: IP): Route<T>[] {
        if (this.route.contain(ip)) {
            for (let i = 0, len = this.subTree.length; i < len; i++) {
                if (this.subTree[i].route.contain(ip)) {
                    return this.subTree[i].searchRoute(ip);
                }
            }

            const res: Route<T>[] = [];
            res.push(this.route);
            for (let i = 0, len = this.redundantRotue.length; i < len; i++) {
                res.push(this.redundantRotue[i]);
            }
            return res;
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

        for (let i = 0, len = this.subTree.length; i < len; i++) {
            const res = this.subTree.splice(i, 1)[0].removeRoute(route);;
            for (let j = 0, len = res.length; j < len; j++) {
                this.subTree.push(res[j]);
            }
        }
        return [this];
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
