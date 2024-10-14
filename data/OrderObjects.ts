import { arrayStableSort } from "./arrayStableSort.js";

export { OrderObjects };

class OrderObjects<KEY, VALUE> implements Iterable<VALUE> {
    private keys: KEY[];
    private values: Map<KEY, VALUE>;

    private validateFunc: (value: VALUE) => boolean;

    get length(): number {
        return this.keys.length;
    }
    set length(len: number) {
        len = (len >= 0) ? len : 0;

        while (this.length > len) {
            this.pop();
        }
    }

    get first(): VALUE | undefined {
        return this.item(0);
    }

    get last(): VALUE | undefined {
        return this.item(this.length - 1);
    }

    constructor(validateFunc: (value: VALUE) => boolean = () => { return true; }) {
        this.keys = [];
        this.values = new Map();

        this.validateFunc = validateFunc;
    }

    public getValue(key: KEY): VALUE | undefined {
        return this.values.get(key);
    }
    public getValueWithPushDefault(key: KEY, defaultValueGenerateFunc: (key: KEY) => VALUE): VALUE {
        if (!this.hasKey(key)) {
            this.push(key, defaultValueGenerateFunc(key));
        }
        return this.getValueNotUndefined(key);
    }
    public getValueNotUndefined(key: KEY): VALUE {
        const v = this.getValue(key);
        if (v == undefined) {
            throw new Error("key [" + key + "] is undefined");
        }
        return v;
    }

    public item(index: number): VALUE | undefined {
        const key = this.keys[index];
        if (key == undefined) { return undefined; }
        return this.values.get(key);
    }

    public getKey(index: number): KEY | undefined {
        return this.keys[index];
    }

    public getIndex(key: KEY): number {
        return this.keys.indexOf(key);
    }

    public getKeys(): KEY[] {
        return this.keys.concat();
    }
    public getMatchedKeys(discriminantFunction = function (a: VALUE): boolean { return true; }): KEY[] {
        const matchKeys: KEY[] = [];

        for (const key of this.keys) {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            if (discriminantFunction(value)) {
                matchKeys.push(key);
            }
        }

        return matchKeys;
    }

    public search(discriminantFunction = function (a: VALUE): boolean { return true; }): VALUE[] {
        const matchValues: VALUE[] = [];

        for (const key of this.keys) {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            if (discriminantFunction(value)) {
                matchValues.push(value);
            }
        }

        return matchValues;
    }

    public hasKey(key: KEY): boolean {
        return this.keys.includes(key);
    }

    public push(key: KEY, val: VALUE): boolean {
        if (this.hasKey(key)) { console.warn("key[" + key + "] already exists"); return false; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return false; }

        this.keys.push(key);
        this.values.set(key, val);
        return true;
    }

    public move(targetIndex: number, toIndex: number): boolean {
        if (targetIndex < 0 || targetIndex >= this.keys.length) {
            console.warn("index out of range", targetIndex);
            return false;
        }

        if (toIndex < 0) {
            toIndex = 0;
        } else if (toIndex >= this.keys.length) {
            toIndex = this.keys.length - 1;
        } else if (targetIndex < toIndex) {
            toIndex--;
        }

        if (targetIndex === toIndex) {
            return false;
        }

        const target = this.keys.splice(targetIndex, 1);
        this.keys.splice(toIndex, 0, ...target);
        return true;
    }
    public moveByKey(targetKey: KEY, toIndex: number): boolean {
        return this.move(this.getIndex(targetKey), toIndex);
    }
    public moveTo(targetKey: KEY, toKey: KEY, offset: number = 0): boolean {
        return this.move(this.getIndex(targetKey), this.getIndex(toKey) + offset);
    }

    public replace(key: KEY, val: VALUE): boolean {
        if (!this.hasKey(key)) { console.warn("key[" + key + "] not exists"); return false; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return false; }

        this.values.set(key, val);
        return true;
    }

    public set(key: KEY, val: VALUE): boolean {
        if (this.hasKey(key)) {
            return this.replace(key, val);
        } else {
            return this.push(key, val);
        }
    }

    public pop(): VALUE | undefined {
        const key = this.keys.pop();
        if (key == undefined) { return undefined; }

        const val = this.values.get(key);
        this.values.delete(key);

        return val;
    }

    public shift(): VALUE | undefined {
        const key = this.keys.shift();
        if (key == undefined) { return undefined; }

        const val = this.values.get(key);
        this.values.delete(key);

        return val;
    }

    public deleteWithIndex(index: number): VALUE | undefined {
        if (index < 0 || index >= this.keys.length) {
            return undefined;
        }
        const key = this.keys[index];
        if (key == undefined) { return undefined; }

        const val = this.values.get(key);
        this.values.delete(key);

        this.keys.splice(index, 1);

        return val;
    }

    public delete(key: KEY): VALUE | undefined {
        return this.deleteWithIndex(this.keys.indexOf(key));
    }

    public sort(compareIfMoveBehindFunc = function (a: VALUE, b: VALUE) { return a > b; }): void {
        arrayStableSort(this.keys, (keyA, keyB) => {
            const valueA = this.getValue(keyA);
            if (valueA == undefined) { throw new Error("internal error"); }

            const valueB = this.getValue(keyB);
            if (valueB == undefined) { throw new Error("internal error"); }

            return compareIfMoveBehindFunc(valueA, valueB)
        });
    }

    public forEach(func: (val: VALUE) => void): void {
        this.keys.forEach((key) => {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            func(value);
        });
    }

    public [Symbol.iterator](): Iterator<VALUE> {
        let pointer = 0;
        let keys = this.keys;
        let values = this.values;

        return {
            next(): IteratorResult<VALUE> {
                if (pointer < keys.length) {
                    const key = keys[pointer++];
                    if (key == undefined) { throw new Error("internal error"); }

                    const value = values.get(key);
                    if (value == undefined) { throw new Error("internal error"); }

                    return {
                        done: false,
                        value: value
                    };
                } else {
                    return {
                        done: true,
                        value: null
                    };
                }
            }
        };
    }

    public setInternalData(data: { keys: KEY[], values: Map<KEY, VALUE> }): void {
        this.clear();

        if (!!data.keys) {
            for (let i = 0, len = data.keys.length; i < len; i++) {
                const key = data.keys[i];
                if (key == undefined) { throw new Error("internal error"); }

                const value = data.values.get(key);
                if (value == undefined) { throw new Error("internal error"); }

                this.push(key, value);
            }
        }
    }

    public clear(): void {
        this.keys = [];
        this.values.clear();
    }

    public toJSON() {
        return { keys: this.keys, values: this.values };
    }
}
