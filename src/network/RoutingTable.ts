import { Route } from "./Route.js";

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

    public show(): void {
        console.group(this.route.toString());
        this.subTree.forEach((t) => {
            t.show();
        });
        console.groupEnd();
        return;
        console.group("route");
        console.log(this.route.toString());
        console.group("redundant");
        this.redundantRotue.forEach((r) => {
            console.log(r.toString());
        });
        console.groupEnd();
        console.group("subTree");
        this.subTree.forEach((t) => {
            t.show();
        });
        console.groupEnd();
        console.groupEnd();
    }
}
