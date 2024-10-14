import { OrderObjects } from "./OrderObjects.js";

export { OrderObjectsAutoKey, keyGenerateFromLength };

class OrderObjectsAutoKey<KEY, VALUE> extends OrderObjects<KEY, VALUE> {
    private keyGeneratefunc: (arr: OrderObjectsAutoKey<KEY, VALUE>, value: VALUE) => KEY;

    constructor(keyGeneratefunc: (arr: OrderObjectsAutoKey<KEY, VALUE>, value: VALUE) => KEY) {
        super();

        this.keyGeneratefunc = keyGeneratefunc;
    }

    /** @deprecated keyが競合する可能性があります、代わりにpushAutoを利用してください */
    public override push(key: KEY, val: VALUE): boolean {
        return super.push(key, val);
    }
    public pushAuto(val: VALUE): { key: KEY, success: boolean } {
        const key = this.keyGeneratefunc(this, val);
        const success = super.push(key, val);
        return { key, success, };
    }

    /** @deprecated keyが競合する可能性があります、代わりにgetValueWithPushAutoDefaultを利用してください */
    public override getValueWithPushDefault(key: KEY, defaultValueGenerateFunc: (key: KEY) => VALUE): VALUE {
        return super.getValueWithPushDefault(key, defaultValueGenerateFunc);
    }
    public getValueWithPushAutoDefault(key: KEY, defaultValueGenerateFunc: (key: KEY) => VALUE): VALUE {
        if (!this.hasKey(key)) {
            this.pushAuto(defaultValueGenerateFunc(key));
        }
        return this.getValueNotUndefined(key);
    }
}

function keyGenerateFromLength<VALUE>(arr: OrderObjectsAutoKey<number, VALUE>): number {
    return arr.length;
}
