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

    /** @deprecated idが競合する可能性があります、代わりにgetValueWithPushAutoDefaultを利用してください */
    public override getValueWithPushDefault(key: string, defaultValueGenerateFunc: (key: string) => V): V {
        return super.getValueWithPushDefault(key, defaultValueGenerateFunc);
    }
    public getValueWithPushAutoDefault(key: string, defaultValueGenerateFunc: (key: string) => V): V {
        if (!this.hasKey(key)) {
            this.pushAuto(defaultValueGenerateFunc(key));
        }
        return this.getValueNotUndefined(key);
    }
}

function keyGenerateFromLength<V>(arr: OrderObjectsAutoKey<V>) {
    return String(arr.length);
}
