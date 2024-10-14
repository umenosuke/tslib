import { OrderObjects } from "./OrderObjects.js";

export { OrderObjectsAutoKey, keyGenerateFromLength };

class OrderObjectsAutoKey<KEY, VALUE> extends OrderObjects<KEY, VALUE> {
    private keyGeneratefunc: (value: VALUE, arr: OrderObjectsAutoKey<KEY, VALUE>) => KEY;

    constructor(keyGeneratefunc: (value: VALUE, arr: OrderObjectsAutoKey<KEY, VALUE>) => KEY) {
        super();

        this.keyGeneratefunc = keyGeneratefunc;
    }

    /** @deprecated keyが競合する可能性があります、代わりにpushAutoを利用してください */
    public override push(key: KEY, val: VALUE): "success" | "already exists" | "invalid value" {
        return super.push(key, val);
    }
    public pushAuto(val: VALUE): "success" | "already exists" | "invalid value" {
        const key = this.keyGeneratefunc(val, this);
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
    public override replace(key: KEY, val: VALUE): ({ status: "success", old: VALUE } | { status: "not exists" } | { status: "invalid value" }) {
        return super.replace(key, val);
    }
    public replaceAuto(val: VALUE): ({ status: "success", old: VALUE } | { status: "not exists" } | { status: "invalid value" }) {
        const key = this.keyGeneratefunc(val, this);
        return super.replace(key, val);
    }

    /** @deprecated keyが競合する可能性があります、代わりにsetAutoを利用してください */
    public override set(key: KEY, val: VALUE): ({ status: "success push" } | { status: "success replace", old: VALUE } | { status: "invalid value" } | { status: "fail" }) {
        return super.set(key, val);
    }
    public setAuto(val: VALUE): ({ status: "success push" } | { status: "success replace", old: VALUE } | { status: "invalid value" } | { status: "fail" }) {
        const key = this.keyGeneratefunc(val, this);
        return super.set(key, val);
    }
}

function keyGenerateFromLength(_: unknown, arr: OrderObjectsAutoKey<number, unknown>): number {
    return arr.length;
}
