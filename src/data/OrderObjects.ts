import { arrayStableSort } from "./arrayStableSort.js";

export { OrderObjects };

class OrderObjects<T> implements Iterable<T> {
    private keys: string[];
    private values: { [key: string]: T };

    private validateFunc: (value: T) => boolean;

    get length(): number {
        return this.keys.length;
    }
    set length(len: number) {
        len = (len >= 0) ? len : 0;

        while (this.length > len) {
            this.pop();
        }
    }

    constructor(validateFunc: (value: T) => boolean = () => { return true; }) {
        this.keys = [];
        this.values = {};

        this.validateFunc = validateFunc;
    }

    public getValue(key: string): T | undefined {
        return this.values[key];
    }

    public item(index: number): T | undefined {
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
    public getMatchedKeys(discriminantFunction = function (a: T): boolean { return true; }): string[] {
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

    public hasKey(key: string): boolean {
        return this.keys.indexOf(key) !== -1;
    }

    public push(key: string, val: T): void {
        if (this.hasKey(key)) { console.warn("key[" + key + "] already exists"); return; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return; }

        this.keys.push(key);
        this.values[key] = val;
    }

    public move(targetIndex: number, toIndex: number): void {
        if (targetIndex < 0 || targetIndex >= this.keys.length) {
            console.warn("index out of range", targetIndex);
            return;
        }

        if (toIndex < 0) {
            toIndex = 0;
        } else if (toIndex >= this.keys.length) {
            toIndex = this.keys.length - 1;
        } else if (targetIndex < toIndex) {
            toIndex--;
        }

        if (targetIndex === toIndex) {
            return;
        }

        const target = this.keys.splice(targetIndex, 1);
        this.keys.splice(toIndex, 0, ...target);
    }
    public moveByKey(targetKey: string, toIndex: number): void {
        this.move(this.getIndex(targetKey), toIndex);
    }
    public moveTo(targetKey: string, toKey: string, offset: number = 0): void {
        this.move(this.getIndex(targetKey), this.getIndex(toKey) + offset);
    }

    public replace(key: string, val: T): void {
        if (!this.hasKey(key)) { console.warn("key[" + key + "] not exists"); return; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return; }

        this.values[key] = val;
    }

    public pop(): T | undefined {
        const key = this.keys.pop();
        if (key == undefined) { return undefined; }

        const val = this.values[key];
        delete this.values[key];

        return val;
    }

    public shift(): T | undefined {
        const key = this.keys.shift();
        if (key == undefined) { return undefined; }

        const val = this.values[key];
        delete this.values[key];

        return val;
    }

    public deleteWithIndex(index: number): T | undefined {
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

    public delete(key: string): T | undefined {
        return this.deleteWithIndex(this.keys.indexOf(key));
    }

    public sort(compareIfMoveBehindFunc = function (a: T, b: T) { return a > b; }): void {
        arrayStableSort(this.keys, (keyA, keyB) => {
            const valueA = this.getValue(keyA);
            if (valueA == undefined) { throw new Error("internal error"); }

            const valueB = this.getValue(keyB);
            if (valueB == undefined) { throw new Error("internal error"); }

            return compareIfMoveBehindFunc(valueA, valueB)
        });
    }

    public forEach(func: (val: T) => void): void {
        this.keys.forEach((key) => {
            const value = this.getValue(key);
            if (value == undefined) { throw new Error("internal error"); }

            func(value);
        });
    }

    public [Symbol.iterator](): Iterator<T> {
        let pointer = 0;
        let keys = this.keys;
        let values = this.values;

        return {
            next(): IteratorResult<T> {
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

    public set(data: { keys: string[], values: { [key: string]: T } }): void {
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
