import type { tJson } from "../data/typeJson.js";
import type { exEvent } from "../html/exEvents.js";
import { TokenBucket } from "../time/TokenBucket.js";
import type { RecursivePartial } from "../type/RecursivePartial.js";

export { OptionBase, type PropertyTypeMap, type PropertyInfo, type PropertyData };

export const OptionBaseConsoleOption = {
    debug: false,
    warn: false,
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
} | {
    "type": "nest",
    "child": PropertyInfo,
    "label": string,
}>;

type PropertyData<PROPERTY_INFO extends PropertyInfo> = {
    [K in keyof PROPERTY_INFO]: PROPERTY_INFO[K]["type"] extends keyof PropertyTypeMap
    ? PropertyTypeMap[PROPERTY_INFO[K]["type"]]
    : PROPERTY_INFO[K]["type"] extends "nest"
    ? PROPERTY_INFO[K] extends { "child": infer C }
    ? C extends PropertyInfo
    ? PropertyData<C>
    : never
    : never :
    never
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

    public async load(): Promise<boolean> {
        if (OptionBaseConsoleOption.debug) {
            console.log("Option load");
        }
        try {
            const loadRes = await this.loadFunc();
            if (loadRes.abort) {
                if (OptionBaseConsoleOption.warn) {
                    console.warn("config load abort");
                }
                return false;
            }

            const loadData = <tJson>JSON.parse(loadRes.dataStr);
            if (!dataTypeGuard(loadData, this.dataPropertyInfo)) {
                if (OptionBaseConsoleOption.error) {
                    console.error("!this.valueTypeGuard(loadData) : " + loadRes.dataStr);
                }
                return false;
            }

            this.setData(loadData);
            return true;
        } catch (err) {
            if (OptionBaseConsoleOption.error) {
                console.error("load error : ", err);
            }
            return false;
        }
    }

    public setData(fromData: RecursivePartial<PropertyData<DATA_PROPERTY_INFO>>): void {
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

    public generateHtmlElements(): DocumentFragment {
        return generateHtmlElements(this.data, async () => {
            await this.save();
        }, this.dataPropertyInfo);
    }
}

function dataTypeGuard<DATA_PROPERTY_INFO extends PropertyInfo>(data: any, dataPropertyInfo: DATA_PROPERTY_INFO): data is RecursivePartial<PropertyData<DATA_PROPERTY_INFO>> | undefined {
    for (const key in dataPropertyInfo) {
        // なんでundefinedになる可能性があるんやろ？
        const dataExpectType = dataPropertyInfo[key]?.["type"];
        if (dataExpectType == undefined) {
            if (OptionBaseConsoleOption.error) {
                console.error("dataExpectType == undefined");
            }
            return false;
        }

        if (data[key] == undefined) {
            return true;
        }

        switch (dataExpectType) {
            case "number":
            case "string":
            case "boolean": {
                if (typeof data[key] !== dataExpectType) {
                    if (OptionBaseConsoleOption.warn) {
                        console.warn("dataTypeGuard fail", {
                            dataIn: data,
                            key: key,
                            dataType: typeof data[key],
                            dataVal: data[key],
                            dataExpectType: dataExpectType,
                        });
                    }
                    return false;
                }
                break;
            }

            case "nest": {
                if (typeof data[key] !== "object") {
                    if (OptionBaseConsoleOption.warn) {
                        console.warn("dataTypeGuard nest fail", {
                            dataIn: data,
                            key: key,
                            dataType: typeof data[key],
                            dataVal: data[key],
                            dataExpectType: "object",
                        });
                    }
                    return false;
                }

                const dataPropertyInfoChildInfo = dataPropertyInfo[key]?.["child"];
                if (dataPropertyInfoChildInfo == undefined) {
                    if (OptionBaseConsoleOption.error) {
                        console.error("dataPropertyInfoChildInfo == undefined");
                    }
                    return false;
                }

                if (!dataTypeGuard(data[key], dataPropertyInfoChildInfo)) {
                    if (OptionBaseConsoleOption.warn) {
                        console.warn("dataTypeGuard nest fail", {
                            dataIn: data,
                            key: key,
                            dataVal: data[key],
                            dataExpectType: dataPropertyInfoChildInfo,
                        });
                    }
                    return false;
                }
                break;
            }

            default: {
                if (OptionBaseConsoleOption.error) {
                    console.error("unknown dataExpectType", dataExpectType);
                }
                return false;
            }
        }
    }

    return true;
}

function isDataPropertyKey<DATA_PROPERTY_INFO extends PropertyInfo>(key: any, dataPropertyInfo: DATA_PROPERTY_INFO): key is keyof DATA_PROPERTY_INFO {
    for (const k in dataPropertyInfo) {
        if (key === k) {
            return true;
        }
    }

    if (OptionBaseConsoleOption.warn) {
        const keyExpectList: any[] = [];
        for (const k in dataPropertyInfo) {
            keyExpectList.push(k);
        }
        console.warn("isDataPropertyKey fail", {
            keyIn: key,
            keyExpectList: keyExpectList,
        });
    }
    return false;
};

function generateHtmlElements<DATA_PROPERTY_INFO extends PropertyInfo>(data: PropertyData<DATA_PROPERTY_INFO>, saveFunc: () => Promise<void>, dataPropertyInfo: DATA_PROPERTY_INFO): DocumentFragment {
    const handlerList: { [key in keyof PropertyTypeMap]: EventListenerObject } = {
        boolean: {
            handleEvent:
                async (e: exEvent<HTMLInputElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const checkbox = e.currentTarget;
                    checkbox.readOnly = true;

                    try {
                        const key = checkbox.dataset["key"];
                        if (!isDataPropertyKey(key, dataPropertyInfo)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = checkbox.checked;
                        // 多分大丈夫だけどいつか改善したい
                        (data as any)[key] = val;
                        await saveFunc();
                    } catch (e) {
                        if (OptionBaseConsoleOption.error) {
                            console.error(e);
                        }
                    }

                    checkbox.readOnly = false;
                },
        },
        string: {
            handleEvent:
                async (e: exEvent<HTMLInputElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const input = e.currentTarget;
                    input.readOnly = true;

                    try {
                        const key = input.dataset["key"];
                        if (!isDataPropertyKey(key, dataPropertyInfo)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = input.value;
                        // 多分大丈夫だけどいつか改善したい
                        (data as any)[key] = val;
                        await saveFunc();
                    } catch (e) {
                        if (OptionBaseConsoleOption.error) {
                            console.error(e);
                        }
                    }

                    input.readOnly = false;
                },
        },
        number: {
            handleEvent:
                async (e: exEvent<HTMLInputElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const input = e.currentTarget;
                    input.readOnly = true;

                    try {
                        const key = input.dataset["key"];
                        if (!isDataPropertyKey(key, dataPropertyInfo)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = Number.parseFloat(input.value);
                        if (Number.isNaN(val) || !Number.isFinite(val)) {
                            throw new Error("Number.isNaN(val) || !Number.isFinite(val)");
                        }
                        // 多分大丈夫だけどいつか改善したい
                        (data as any)[key] = val;
                        await saveFunc();
                    } catch (e) {
                        if (OptionBaseConsoleOption.error) {
                            console.error(e);
                        }
                    }

                    input.readOnly = false;
                },
        }
    };

    const frag = document.createDocumentFragment();

    for (const key in dataPropertyInfo) {
        const p = dataPropertyInfo[key];
        const d = data[key];

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
                            checkbox.addEventListener("click", handlerList[p.type]);
                        }
                    }
                    {
                        const span = document.createElement("span");
                        label.appendChild(span);
                        {
                            span.textContent = p.label;
                        }
                    }
                    frag.appendChild(document.createElement("br"));
                }
                break;
            }

            case "string": {
                const val = <PropertyTypeMap[typeof p.type]>d;
                const label = document.createElement("label");
                frag.appendChild(label);
                {
                    {
                        const span = document.createElement("span");
                        label.appendChild(span);
                        {
                            span.textContent = p.label;
                        }
                    }
                    {
                        const input = document.createElement("input");
                        label.appendChild(input);
                        {
                            input.dataset["key"] = key;
                            input.type = "text";
                            // 多分大丈夫だけどいつか改善したい
                            input.value = val;
                            input.addEventListener("change", handlerList[p.type]);
                        }
                    }
                    frag.appendChild(document.createElement("br"));
                }

                break;
            }

            case "number": {
                const val = <PropertyTypeMap[typeof p.type]>d;
                const label = document.createElement("label");
                frag.appendChild(label);
                {
                    {
                        const span = document.createElement("span");
                        label.appendChild(span);
                        {
                            span.textContent = p.label;
                        }
                    }
                    {
                        const input = document.createElement("input");
                        label.appendChild(input);
                        {
                            input.dataset["key"] = key;
                            input.type = "number";
                            // 多分大丈夫だけどいつか改善したい
                            input.value = String(val);
                            input.addEventListener("change", handlerList[p.type]);
                        }
                    }
                    frag.appendChild(document.createElement("br"));
                }
                break;
            }

            case "nest": {
                const div = document.createElement("div");
                frag.appendChild(div);
                {
                    {
                        const span = document.createElement("span");
                        div.appendChild(span);
                        {
                            span.textContent = p.label;
                        }
                    }
                    {
                        div.appendChild(document.createElement("br"));
                    }
                }
                {
                    const dataPropertyInfoChild = dataPropertyInfo[key];
                    if (dataPropertyInfoChild == undefined) {
                        if (OptionBaseConsoleOption.error) {
                            console.error("dataPropertyInfoChild == undefined");
                        }
                        throw new Error("dataPropertyInfoChild == undefined");
                    }
                    if (dataPropertyInfoChild.type !== "nest") {
                        if (OptionBaseConsoleOption.error) {
                            console.error("dataPropertyInfoChild.type !== nest");
                        }
                        throw new Error("dataPropertyInfoChild.type !== nest");
                    }
                    const dataPropertyInfoChildInfo = dataPropertyInfoChild["child"];
                    if (dataPropertyInfoChildInfo == undefined) {
                        if (OptionBaseConsoleOption.error) {
                            console.error("dataPropertyInfoChildInfo == undefined");
                        }
                        throw new Error("dataPropertyInfoChildInfo == undefined");
                    }

                    // dがnestの時の型が欠落するのはなんでじゃろか
                    if (typeof d !== "object") {
                        if (OptionBaseConsoleOption.error) {
                            console.error("nest error", { data: d, });
                        }
                        throw new Error("nest data is not object");
                    }

                    div.appendChild(generateHtmlElements(d, saveFunc, dataPropertyInfoChildInfo));
                }
                break;
            }

            default: {
                if (OptionBaseConsoleOption.error) {
                    console.error("unknown p.type", p);
                }
                throw new Error("unknown p.type");
            }
        }
    }

    return frag;
}
