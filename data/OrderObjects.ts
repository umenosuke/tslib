import { arrayStableSort } from "./arrayStableSort.js";

export { OrderObjects };

class OrderObjects<V> implements Iterable<V> {
    private keys: string[];
    private values: { [key: string]: V };

    private validateFunc: (value: V) => boolean;

    get length(): number {
        return this.keys.length;
    }
    set length(len: number) {
        len = (len >= 0) ? len : 0;

        while (this.length > len) {
            this.pop();
        }
    }

    get first(): V | undefined {
        return this.item(0);
    }

    get last(): V | undefined {
        return this.item(this.length - 1);
    }

    constructor(validateFunc: (value: V) => boolean = () => { return true; }) {
        this.keys = [];
        this.values = {};

        this.validateFunc = validateFunc;
    }

    public getValue(key: string): V | undefined {
        return this.values[key];
    }
    public getValueWithPushDefault(key: string, defaultValueGenerateFunc: (key: string) => V): V {
        if (!this.hasKey(key)) {
            this.push(key, defaultValueGenerateFunc(key));
        }
        return this.getValueNotUndefined(key);
    }
    public getValueNotUndefined(key: string): V {
        const v = this.getValue(key);
        if (v == undefined) {
            throw new Error("key [" + key + "] is undefined");
        }
        return v;
    }

    public item(index: number): V | undefined {
        const key = this.keys[index];
        if (key == undefined) { return undefined; }
        return this.values[key];
    }

    public getKey(index: number): string | undefined {
        return this.keys[index];
    }

    public getIndex(key: string): number {
        return this.keys.indexOf(key);
    }

    public getKeys(): string[] {
        return this.keys.concat();
    }
    public getMatchedKeys(discriminantFunction = function (a: V): boolean { return true; }): string[] {
        const matchKeys: string[] = [];

        for (const key of this.keys) {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            if (discriminantFunction(value)) {
                matchKeys.push(key);
            }
        }

        return matchKeys;
    }

    public search(discriminantFunction = function (a: V): boolean { return true; }): V[] {
        const matchValues: V[] = [];

        for (const key of this.keys) {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            if (discriminantFunction(value)) {
                matchValues.push(value);
            }
        }

        return matchValues;
    }

    public hasKey(key: string): boolean {
        return this.keys.indexOf(key) !== -1;
    }

    public push(key: string, val: V): boolean {
        if (this.hasKey(key)) { console.warn("key[" + key + "] already exists"); return false; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return false; }

        this.keys.push(key);
        this.values[key] = val;
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
    public moveByKey(targetKey: string, toIndex: number): boolean {
        return this.move(this.getIndex(targetKey), toIndex);
    }
    public moveTo(targetKey: string, toKey: string, offset: number = 0): boolean {
        return this.move(this.getIndex(targetKey), this.getIndex(toKey) + offset);
    }

    public replace(key: string, val: V): boolean {
        if (!this.hasKey(key)) { console.warn("key[" + key + "] not exists"); return false; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return false; }

        this.values[key] = val;
        return true;
    }

    public pop(): V | undefined {
        const key = this.keys.pop();
        if (key == undefined) { return undefined; }

        const val = this.values[key];
        delete this.values[key];

        return val;
    }

    public shift(): V | undefined {
        const key = this.keys.shift();
        if (key == undefined) { return undefined; }

        const val = this.values[key];
        delete this.values[key];

        return val;
    }

    public deleteWithIndex(index: number): V | undefined {
        if (index < 0 || index >= this.keys.length) {
            return undefined;
        }
        const key = this.keys[index];
        if (key == undefined) { return undefined; }

        const val = this.values[key];
        delete this.values[key];

        this.keys.splice(index, 1);

        return val;
    }

    public delete(key: string): V | undefined {
        return this.deleteWithIndex(this.keys.indexOf(key));
    }

    public sort(compareIfMoveBehindFunc = function (a: V, b: V) { return a > b; }): void {
        arrayStableSort(this.keys, (keyA, keyB) => {
            const valueA = this.getValue(keyA);
            if (valueA == undefined) { throw new Error("internal error"); }

            const valueB = this.getValue(keyB);
            if (valueB == undefined) { throw new Error("internal error"); }

            return compareIfMoveBehindFunc(valueA, valueB)
        });
    }

    public forEach(func: (val: V) => void): void {
        this.keys.forEach((key) => {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            func(value);
        });
    }

    public [Symbol.iterator](): Iterator<V> {
        let pointer = 0;
        let keys = this.keys;
        let values = this.values;

        return {
            next(): IteratorResult<V> {
                if (pointer < keys.length) {
                    const key = keys[pointer++];
                    if (key == undefined) { throw new Error("internal error"); }

                    const value = values[key];
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

    public setInternalData(data: { keys: string[], values: { [key: string]: V } }): void {
        this.clear();

        if (!!data.keys) {
            for (let i = 0, len = data.keys.length; i < len; i++) {
                const key = data.keys[i];
                if (key == undefined) { throw new Error("internal error"); }

                const value = data.values[key];
                if (value == undefined) { throw new Error("internal error"); }

                this.push(key, value);
            }
        }
    }

    public clear(): void {
        this.keys = [];
        this.values = {};
    }

    public toJSON() {
        return { keys: this.keys, values: this.values };
    }
}
