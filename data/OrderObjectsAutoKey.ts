import { OrderObjects } from "./OrderObjects.js";

export { OrderObjectsAutoKey };

class OrderObjectsAutoKey<V> extends OrderObjects<V> {
    private keyGeneratefunc: (arr: OrderObjectsAutoKey<V>, value: V) => string;

    constructor(keyGeneratefunc: (arr: OrderObjectsAutoKey<V>, value: V) => string = (arr => String(arr.length))) {
        super();

        this.keyGeneratefunc = keyGeneratefunc;
    }

    public pushAuto(val: V): boolean {
        return super.push(this.keyGeneratefunc(this, val), val);
    }
}
