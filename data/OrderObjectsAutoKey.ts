import { OrderObjects } from "./OrderObjects.js";

export { OrderObjectsAutoKey };

class OrderObjectsAutoKey<V> extends OrderObjects<V> {
    private keyGeneratefunc: (arr: OrderObjectsAutoKey<V>, value: V) => string;

    constructor(keyGeneratefunc: (arr: OrderObjectsAutoKey<V>, value: V) => string = (arr => String(arr.length))) {
        super();

        this.keyGeneratefunc = keyGeneratefunc;
    }

    public pushAuto(val: V): { id: string, success: boolean } {
        const id = this.keyGeneratefunc(this, val);
        const success = super.push(id, val);
        return { id, success, };
    }
}
