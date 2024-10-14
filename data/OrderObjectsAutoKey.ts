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
    public pushAuto(val: VALUE): boolean {
        const key = this.keyGeneratefunc(this, val);
        return super.push(key, val);
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

    /** @deprecated keyが競合する可能性があります、代わりにreplaceAutoを利用してください */
    public override replace(key: KEY, val: VALUE): boolean {
        return super.replace(key, val);
    }
    public replaceAuto(val: VALUE): boolean {
        const key = this.keyGeneratefunc(this, val);
        return super.replace(key, val);
    }

    /** @deprecated keyが競合する可能性があります、代わりにsetAutoを利用してください */
    public override set(key: KEY, val: VALUE): boolean {
        return super.set(key, val);
    }
    public setAuto(val: VALUE): boolean {
        const key = this.keyGeneratefunc(this, val);
        return super.set(key, val);
    }
}

function keyGenerateFromLength<VALUE>(arr: OrderObjectsAutoKey<number, VALUE>): number {
    return arr.length;
}
