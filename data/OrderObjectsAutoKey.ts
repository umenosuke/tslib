import { OrderObjects } from "./OrderObjects.js";

export { OrderObjectsAutoKey, keyGenerateFromLength };

class OrderObjectsAutoKey<V> extends OrderObjects<V> {
    private keyGeneratefunc: (arr: OrderObjectsAutoKey<V>, value: V) => string;

    constructor(keyGeneratefunc: (arr: OrderObjectsAutoKey<V>, value: V) => string) {
        super();

        this.keyGeneratefunc = keyGeneratefunc;
    }

    /** @deprecated idが競合する可能性があります、代わりにpushAutoを利用してください */
    public override push(id: string, val: V): boolean {
        return super.push(id, val);
    }

    public pushAuto(val: V): { id: string, success: boolean } {
        const id = this.keyGeneratefunc(this, val);
        const success = super.push(id, val);
        return { id, success, };
    }
}

function keyGenerateFromLength<V>(arr: OrderObjectsAutoKey<V>) {
    return String(arr.length);
}
