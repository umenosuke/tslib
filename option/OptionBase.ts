import type { tJson } from "../data/typeJson.js";
import type { exEvent } from "../html/exEvents.js";
import { TokenBucket } from "../time/TokenBucket.js";
import type { RecursivePartial } from "../type/RecursivePartial.js";

export { OptionBase, type PropertyTypeMap, type PropertyInfo, type PropertyData };

export const OptionBaseConsoleOption = {
    debug: false,
    error: true,
};

type PropertyTypeMap = {
    "boolean": boolean,
    "string": string,
    "number": number,
};
type PropertyInfo = Record<string, {
    "type": keyof PropertyTypeMap,
    "label": string,
}>;
type PropertyData<PROPERTY_INFO extends PropertyInfo> = {
    [K in keyof PROPERTY_INFO]: PropertyTypeMap[PROPERTY_INFO[K]["type"]]
};

class OptionBase<DATA_PROPERTY_INFO extends PropertyInfo> {
    public readonly dataPropertyInfo: DATA_PROPERTY_INFO;
    public readonly data: PropertyData<DATA_PROPERTY_INFO>;

    private saveFunc: (dataStr: string) => Promise<void>;
    private loadFunc: () => Promise<{
        abort: false,
        dataStr: string,
    } | {
        abort: true,
    }>;

    private opt: {
        saveInterval: number
    };

    private tokenBucket: TokenBucket;
    private waiting: boolean;

    constructor(
        {
            dataPropertyInfo,
            defaultData,
            saveFunc,
            loadFunc,
        }: {
            dataPropertyInfo: DATA_PROPERTY_INFO,
            defaultData: PropertyData<DATA_PROPERTY_INFO>,
            saveFunc: (dataStr: string) => Promise<void>,
            loadFunc: () => Promise<{
                abort: false,
                dataStr: string,
            } | {
                abort: true,
            }>,
        },
        {
            saveInterval = 1000,
        }: {
            saveInterval?: number
        } = {},
    ) {
        this.dataPropertyInfo = dataPropertyInfo;
        this.data = defaultData;

        this.saveFunc = saveFunc;
        this.loadFunc = loadFunc;
        this.opt = {
            saveInterval: saveInterval,
        };

        this.tokenBucket = new TokenBucket(this.opt.saveInterval, 1000);
        this.waiting = false;
    }

    public async load() {
        if (OptionBaseConsoleOption.debug) {
            console.log("Option load");
        }
        const loadRes = await this.loadFunc();
        if (loadRes.abort) {
            return;
        }

        const loadData = <tJson>JSON.parse(loadRes.dataStr);
        if (!this.dataTypeGuard(loadData)) {
            throw new Error("!this.valueTypeGuard(loadData) : " + loadRes.dataStr);
        }

        this._load(loadData);
    }

    private _load(fromData: RecursivePartial<{ [K in keyof DATA_PROPERTY_INFO]: PropertyTypeMap[DATA_PROPERTY_INFO[K]["type"]] }>): void {
        for (const key in this.dataPropertyInfo) {
            if (fromData[key] == undefined) {
                continue;
            }
            // 多分大丈夫だけどいつか改善したい
            (this.data as any)[key] = fromData[key];
        }
    }

    public async save() {
        if (this.waiting) {
            return;
        }

        if (this.tokenBucket.tryConsume(this.opt.saveInterval)) {
            this._save();
        } else {
            this.waiting = true;

            (async () => {
                await this.tokenBucket.tryConsumeWait(this.opt.saveInterval);
                this._save();
                this.waiting = false;
            })();
        }
    }

    private async _save() {
        if (OptionBaseConsoleOption.debug) {
            console.log("Option save", this.data);
        }
        await this.saveFunc(JSON.stringify(this.data));
    }

    public dataTypeGuard(data: any): data is PropertyData<DATA_PROPERTY_INFO> | undefined {
        for (const key in this.dataPropertyInfo) {
            // なんでundefinedになる可能性があるんやろ？
            if (data[key] != undefined && typeof data[key] !== this.dataPropertyInfo[key]?.["type"]) {
                return false;
            }
        }

        return true;
    };

    public isDataPropertyKey(key: any): key is keyof DATA_PROPERTY_INFO {
        for (const k in this.dataPropertyInfo) {
            if (key === k) {
                return true;
            }
        }

        return false;
    };

    public generateHtmlElements(): DocumentFragment {
        const frag = document.createDocumentFragment();

        const booleanHandler = {
            handleEvent:
                async (e: exEvent<HTMLInputElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const checkbox = e.currentTarget;
                    checkbox.readOnly = true;

                    try {
                        const key = checkbox.dataset["key"];
                        if (!this.isDataPropertyKey(key)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = checkbox.checked;
                        // 多分大丈夫だけどいつか改善したい
                        (this.data as any)[key] = val;
                        await this.save();
                    } catch (e) {
                        if (OptionBaseConsoleOption.error) {
                            console.error(e);
                        }
                    }

                    checkbox.readOnly = false;
                },
        };
        const stringHandler = {
            handleEvent:
                async (e: exEvent<HTMLInputElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const input = e.currentTarget;
                    input.readOnly = true;

                    try {
                        const key = input.dataset["key"];
                        if (!this.isDataPropertyKey(key)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = input.value;
                        // 多分大丈夫だけどいつか改善したい
                        (this.data as any)[key] = val;
                        await this.save();
                    } catch (e) {
                        if (OptionBaseConsoleOption.error) {
                            console.error(e);
                        }
                    }

                    input.readOnly = false;
                },
        };
        const numberHandler = {
            handleEvent:
                async (e: exEvent<HTMLInputElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const input = e.currentTarget;
                    input.readOnly = true;

                    try {
                        const key = input.dataset["key"];
                        if (!this.isDataPropertyKey(key)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = Number.parseFloat(input.value);
                        if (Number.isNaN(val) || !Number.isFinite(val)) {
                            throw new Error("Number.isNaN(val) || !Number.isFinite(val)");
                        }
                        // 多分大丈夫だけどいつか改善したい
                        (this.data as any)[key] = val;
                        await this.save();
                    } catch (e) {
                        if (OptionBaseConsoleOption.error) {
                            console.error(e);
                        }
                    }

                    input.readOnly = false;
                },
        };

        for (const key in this.dataPropertyInfo) {
            const p = this.dataPropertyInfo[key];
            const d = this.data[key];

            // なんでundefinedになる可能性があるんやろ？
            if (p?.type == undefined || p.label == undefined) {
                throw new Error("p?.type == undefined || p.label == undefined");
            }

            switch (p.type) {
                case "boolean": {
                    const val = <PropertyTypeMap[typeof p.type]>d;
                    const label = document.createElement("label");
                    frag.appendChild(label);
                    {
                        {
                            const checkbox = document.createElement("input");
                            label.appendChild(checkbox);
                            {
                                checkbox.dataset["key"] = key;
                                checkbox.type = "checkbox";
                                // 多分大丈夫だけどいつか改善したい
                                checkbox.checked = val;
                                checkbox.addEventListener("click", booleanHandler);
                            }
                        }
                        {
                            const span = document.createElement("span");
                            label.appendChild(span);
                            {
                                span.textContent = p.label;
                            }
                        }
                        {
                            label.appendChild(document.createElement("br"));
                        }
                    }
                    break;
                }

                case "string": {
                    const val = <PropertyTypeMap[typeof p.type]>d;
                    const label = document.createElement("label");
                    frag.appendChild(label);
                    {
                        {
                            const input = document.createElement("input");
                            label.appendChild(input);
                            {
                                input.dataset["key"] = key;
                                input.type = "text";
                                // 多分大丈夫だけどいつか改善したい
                                input.value = val;
                                input.addEventListener("change", stringHandler);
                            }
                        }
                        {
                            const span = document.createElement("span");
                            label.appendChild(span);
                            {
                                span.textContent = p.label;
                            }
                        }
                        {
                            label.appendChild(document.createElement("br"));
                        }
                    }

                    break;
                }

                case "number": {
                    const val = <PropertyTypeMap[typeof p.type]>d;
                    const label = document.createElement("label");
                    frag.appendChild(label);
                    {
                        {
                            const input = document.createElement("input");
                            label.appendChild(input);
                            {
                                input.dataset["key"] = key;
                                input.type = "number";
                                // 多分大丈夫だけどいつか改善したい
                                input.value = String(val);
                                input.addEventListener("change", numberHandler);
                            }
                        }
                        {
                            const span = document.createElement("span");
                            label.appendChild(span);
                            {
                                span.textContent = p.label;
                            }
                        }
                        {
                            label.appendChild(document.createElement("br"));
                        }
                    }
                    break;
                }

                default: {
                    throw new Error("unknown p.type");
                }
            }
        }

        return frag;
    }
}
