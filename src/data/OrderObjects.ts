import { arrayStableSort } from "./arrayStableSort.js";

export { OrderObjects };

class OrderObjects<T> {
    private keys: string[];
    private values: { [key: string]: T };

    private validateFunc: (value: T) => boolean;

    get length(): number {
        return this.keys.length;
    }
    set length(len: number) {
        len = (len >= 0) ? len : 0;

        while (this.length > len) {
            this.pop(this.length - 1);
        }
    }

    constructor(validateFunc: (value: T) => boolean = () => { return true; }) {
        this.keys = [];
        this.values = {};

        this.validateFunc = validateFunc;
    }

    public getValue(key: string): T {
        return this.values[key];
    }

    public item(index: number): T {
        return this.values[this.keys[index]];
    }

    public getKey(index: number): string {
        return this.keys[index];
    }

    public getKeys(): string[] {
        return this.keys.concat();
    }
    public getMatchedKeys(discriminantFunction = function (a: T): boolean { return true; }): string[] {
        const matchKeys: string[] = [];

        for (let i = 0, len = this.keys.length; i < len; i++) {
            if (discriminantFunction(this.item(i))) {
                matchKeys.push(this.getKey(i));
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

    public replace(key: string, val: T): void {
        if (!this.hasKey(key)) { console.warn("key[" + key + "] not exists"); return; }
        if (!this.validateFunc(val)) { console.warn("invalid value"); return; }

        this.values[key] = val;
    }

    public pop(index: number): T {
        if (index < 0 || index >= this.keys.length) {
            return null;
        }
        const val = this.values[this.keys[index]];
        delete this.values[this.keys[index]];

        this.keys.splice(index, 1);

        return val;
    }

    public delete(key: string): T {
        return this.pop(this.keys.indexOf(key));
    }

    public sort(compareIfMoveBehindFunc = function (a: T, b: T) { return a > b; }): void {
        arrayStableSort(this.keys, (keyA, keyB) => {
            return compareIfMoveBehindFunc(this.getValue(keyA), this.getValue(keyB))
        });
    }

    public forEach(func: (val: T) => void): void {
        this.keys.forEach((key) => {
            func(this.values[key]);
        });
    }

    public set(data: { keys: string[], values: { [key: string]: T } }): void {
        this.clear();

        if (!!data.keys) {
            for (let i = 0, len = data.keys.length; i < len; i++) {
                const key = data.keys[i];
                this.push(key, data.values[key]);
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
