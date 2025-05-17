import { ConsoleWrap } from "../console/ConsoleWrap.js";
import type { tJson } from "../data/typeJson.js";
import { TokenBucket } from "../time/TokenBucket.js";
import type { RecursivePartial } from "../type/RecursivePartial.js";
import { isPropertyInfoEnum, isPropertyInfoNest, isPropertyInfoNumberOrRange, type PropertyData, type PropertyDataEnum, type PropertyInfoList, type PropertyInfoEnum, type PropertyInfoInternalList, type PropertyInfoInternal, type PropertyInfo, type PropertyInfoBoolean, type PropertyInfoString, type PropertyInfoNumber, type PropertyInfoRange, type PropertyInfoNest } from "./type.js";

export { OptionBase, isDataPropertyKey, isEnumValue, Callback };

const consoleWrap = new ConsoleWrap();
export const OptionBaseConsoleOption = consoleWrap.enables;

class OptionBase<DATA_PROPERTY_INFO extends PropertyInfoList> {
    public readonly dataPropertyInfo: PropertyInfoInternalList<DATA_PROPERTY_INFO>;
    public readonly data: PropertyData<DATA_PROPERTY_INFO>;
    private readonly dataReal: PropertyData<DATA_PROPERTY_INFO>;

    private saveFunc: (dataStr: string) => Promise<void>;
    private loadFunc: () => Promise<{
        abort: false,
        dataStr: string,
    } | {
        abort: true,
    }>;

    private opt: {
        saveInterval: number,
        saveOnChanged: boolean,
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
            saveOnChanged = true,
        }: {
            saveInterval?: number,
            saveOnChanged?: boolean,
        } = {},
    ) {
        {
            this.dataPropertyInfo = genPropertyInfoInternal(dataPropertyInfo);
            consoleWrap.log({
                origDataPropertyInfo: dataPropertyInfo,
                dataPropertyInfo: this.dataPropertyInfo,
            });
        }
        {
            const tmpData = genDataGeterSeter(defaultData, this.dataPropertyInfo, () => {
                if (this.opt.saveOnChanged) {
                    this.save();
                }
            });
            consoleWrap.log({
                tmpData,
            });
            this.data = tmpData.wrap;
            this.dataReal = tmpData.real;
        }

        this.saveFunc = saveFunc;
        this.loadFunc = loadFunc;
        this.opt = {
            saveInterval: saveInterval,
            saveOnChanged: saveOnChanged,
        };

        this.tokenBucket = new TokenBucket(this.opt.saveInterval, 1000);
        this.waiting = false;
    }

    public async load(): Promise<{
        abort: true,
    } | {
        abort: false,
        containsInvalidData: boolean,
    }> {
        consoleWrap.log("option load start");
        const nowSaveOnChanged = this.opt.saveOnChanged;
        this.opt.saveOnChanged = false;
        const wrapRes = await (async (): ReturnType<typeof this.load> => {
            try {
                const loadRes = await this.loadFunc();
                if (loadRes.abort) {
                    consoleWrap.warn("option load abort");
                    return {
                        abort: true,
                    };
                }

                const loadData = <tJson>JSON.parse(loadRes.dataStr);
                const setRes = setData(loadData, this.data, this.dataPropertyInfo);
                return {
                    abort: false,
                    containsInvalidData: setRes.containsInvalidData,
                };
            } catch (err) {
                consoleWrap.error("option load error : ", err);
                return {
                    abort: false,
                    containsInvalidData: true,
                };
            }
        })();
        this.opt.saveOnChanged = nowSaveOnChanged;
        consoleWrap.log("option load end");
        return wrapRes;
    }

    public setData(fromData: RecursivePartial<PropertyData<DATA_PROPERTY_INFO>>): ({
        changed: boolean,
        containsInvalidData: boolean,
    }) {
        consoleWrap.log("option setData start");
        const nowSaveOnChanged = this.opt.saveOnChanged;
        this.opt.saveOnChanged = false;
        try {
            const setRes = setData(fromData, this.data, this.dataPropertyInfo);
            if (nowSaveOnChanged && setRes.changed) {
                this.save();
            }

            this.opt.saveOnChanged = nowSaveOnChanged;
            consoleWrap.log("option setData end");
            return setRes;
        } catch (err) {
            consoleWrap.log("option setData fail", {
                err: err,
            });
            this.opt.saveOnChanged = nowSaveOnChanged;
            throw err;
        }
    }

    public save() {
        if (this.waiting) {
            return;
        }

        if (this.tokenBucket.tryConsume(this.opt.saveInterval)) {
            this._save();
        } else {
            this.waiting = true;

            (async () => {
                await this.tokenBucket.tryConsumeWait(this.opt.saveInterval);
                await this._save();
                this.waiting = false;
            })();
        }
    }

    private async _save() {
        consoleWrap.log("Option save", {
            dataObject: this.dataReal,
            dataStr: JSON.stringify(this.dataReal),
        });
        await this.saveFunc(JSON.stringify(this.dataReal));
    }
}

function setData<DATA_PROPERTY_INFO extends PropertyInfoList>(fromData: any, toData: PropertyData<DATA_PROPERTY_INFO>, dataPropertyInfo: PropertyInfoInternalList<DATA_PROPERTY_INFO>): ({
    changed: boolean,
    containsInvalidData: boolean,
}) {
    const res = {
        changed: false,
        containsInvalidData: false,
    };

    if (fromData == undefined) {
        consoleWrap.warn("fromData == undefined");
        res.containsInvalidData = true;
        return res;
    }

    for (const key in dataPropertyInfo) {
        // ここやばポイント
        if (!((k: any): k is keyof DATA_PROPERTY_INFO => {
            return true;
        })(key)) {
            throw new Error("k is not KEYS");
        }

        // なんでundefinedになる可能性があるんやろ？
        const dataExpectType = dataPropertyInfo[key]?.["type"];
        if (dataExpectType == undefined) {
            consoleWrap.error("dataExpectType == undefined");
            throw new Error("dataExpectType == undefined");
        }

        if (fromData[key] == undefined) {
            consoleWrap.warn("fromData[key] == undefined", {
                dataIn: fromData,
                key: key,
                dataType: typeof fromData[key],
                dataVal: fromData[key],
                dataExpectType: dataExpectType,
            });
            res.containsInvalidData = true;
            continue;
        }

        switch (dataExpectType) {
            case "boolean":
            case "string":
            case "number": {
                if (typeof fromData[key] !== dataExpectType) {
                    consoleWrap.warn("setData skip", {
                        dataIn: fromData,
                        key: key,
                        dataType: typeof fromData[key],
                        dataVal: fromData[key],
                        dataExpectType: dataExpectType,
                    });
                    res.containsInvalidData = true;
                    continue;
                }
                if (toData[key] !== fromData[key]) {
                    (toData[key] as any) = fromData[key];
                    res.changed = true;
                }
                continue;
            }

            case "range": {
                if (typeof fromData[key] !== "number") {
                    consoleWrap.warn("setData skip", {
                        dataIn: fromData,
                        key: key,
                        dataType: typeof fromData[key],
                        dataVal: fromData[key],
                        dataExpectType: dataExpectType,
                    });
                    res.containsInvalidData = true;
                    continue;
                }
                if (toData[key] !== fromData[key]) {
                    // ↑でチェックしているから大丈夫かな
                    (toData[key] as any) = <any>fromData[key];
                    res.changed = true;
                }
                continue;
            }

            case "enum": {
                const val: unknown = fromData[key];
                if (typeof val !== "string") {
                    consoleWrap.warn("setData skip", {
                        dataIn: fromData,
                        key: key,
                        dataType: typeof fromData[key],
                        dataVal: fromData[key],
                        dataExpectType: dataExpectType,
                    });
                    res.containsInvalidData = true;
                    continue;
                }

                const dataPropertyInfoEnum = dataPropertyInfo[key];
                if (!isPropertyInfoEnum(dataPropertyInfoEnum)) {
                    consoleWrap.error("!isPropertyInfoEnum(dataPropertyInfoEnum)", {
                        key,
                        dataPropertyInfo,
                    });
                    throw new Error("!isPropertyInfoEnum(dataPropertyInfoEnum)");
                }

                if (!isEnumValue(val, dataPropertyInfoEnum)) {
                    consoleWrap.warn("setData skip", {
                        dataIn: fromData,
                        key: key,
                        dataType: typeof fromData[key],
                        dataVal: fromData[key],
                        dataExpectType: dataExpectType,
                    });
                    res.containsInvalidData = true;
                    continue;
                }

                if (toData[key] !== val) {
                    toData[key] = val;
                    res.changed = true;
                }
                continue;
            }

            case "nest": {
                if (typeof fromData[key] !== "object") {
                    consoleWrap.warn("setData skip nest", {
                        dataIn: fromData,
                        key: key,
                        dataType: typeof fromData[key],
                        dataVal: fromData[key],
                        dataExpectType: "object",
                    });
                    res.containsInvalidData = true;
                    continue;
                }

                const dataPropertyInfoNest = dataPropertyInfo[key];
                if (!isPropertyInfoNest(dataPropertyInfoNest)) {
                    consoleWrap.error("!isPropertyInfoNest(dataPropertyInfoNest)", {
                        key,
                        dataPropertyInfo,
                    });
                    throw new Error("!isPropertyInfoNest(dataPropertyInfoNest)");
                }

                // toData[key]がnestの時の型が欠落するのはなんでじゃろか
                if (typeof toData[key] !== "object") {
                    consoleWrap.error("nest error", { data: toData[key], });
                    throw new Error("nest data is not object");
                }

                // ↓ここやばげ、簡単なチェックはするけど
                const dataPropertyChildInfo = dataPropertyInfoNest["child"];
                if (!(() => {
                    for (const key in <any>dataPropertyChildInfo) {
                        const info = dataPropertyChildInfo[key];
                        if (info == undefined) {
                            return false;
                        }
                        if (info["type"] == "nest") {
                            continue;
                        }
                        if ((info as any)["onSet"] == undefined) {
                            return false;
                        }
                    }

                    return true;
                })()) {
                    consoleWrap.error("invalid dataProperty[child]", {
                        dataPropertyChildInfo
                    });
                    throw new Error("invalid dataProperty[child]");
                }

                const nestRes = setData(fromData[key], toData[key], <any>dataPropertyChildInfo);
                if (nestRes.changed) {
                    res.changed = true;
                }
                if (nestRes.containsInvalidData) {
                    consoleWrap.warn("nestRes contains invalid data", {
                        dataIn: fromData,
                        key: key,
                        dataVal: fromData[key],
                        dataExpectType: dataPropertyInfoNest,
                    });
                    res.containsInvalidData = true;
                }
                continue;
            }

            default: {
                consoleWrap.error("unknown dataExpectType", dataExpectType);
                throw new Error("unknown dataExpectType");
            }
        }
    }

    return res;
}

class Callback<T> {
    private callBackList: Map<string, (oldValue: T, newValue: T) => void>;

    constructor() {
        this.callBackList = new Map();
    }

    public addListener(callback: (newValue: T, oldValue: T) => void): string {
        const id = crypto.randomUUID();
        this.callBackList.set(id, callback);
        return id;
    }
    public removeListener(id: string): void {
        this.callBackList.delete(id);
    }

    public exec(oldValue: T, newValue: T): void {
        for (const [id, callBack] of this.callBackList) {
            try {
                callBack(newValue, oldValue);
            } catch (err) {
                consoleWrap.error("Callback exec fail", {
                    id,
                    err,
                });
            }
        }
    }
}
function genPropertyInfoInternal<DATA_PROPERTY_INFO extends PropertyInfoList>(origDataPropertyInfo: DATA_PROPERTY_INFO): PropertyInfoInternalList<DATA_PROPERTY_INFO> {
    const res: { [key: string]: any } = {};

    for (const propKey in origDataPropertyInfo) {
        // ここやばポイント
        if (!((k: any): k is keyof DATA_PROPERTY_INFO => {
            return true;
        })(propKey)) {
            throw new Error("k is not KEYS");
        }

        // なんでundefinedになる可能性があるんやろ？
        const origDataProperty = origDataPropertyInfo[propKey];
        if (origDataProperty == undefined) {
            consoleWrap.error("dataProperty == undefined");
            throw new Error("dataProperty == undefined");
        }

        switch (origDataProperty["type"]) {
            case "boolean": {
                const temp: PropertyInfoInternal<PropertyInfoBoolean> = {
                    type: "boolean",
                    label: origDataProperty["label"],
                    onSet: new Callback(),
                };
                res[propKey] = temp;
                continue;
            }

            case "string": {
                const temp: PropertyInfoInternal<PropertyInfoString> = {
                    type: "string",
                    label: origDataProperty["label"],
                    onSet: new Callback(),
                };
                res[propKey] = temp;
                continue;
            }

            case "number": {
                const temp: PropertyInfoInternal<PropertyInfoNumber> = {
                    type: "number",
                    label: origDataProperty["label"],
                    min: origDataProperty["min"],
                    max: origDataProperty["max"],
                    step: origDataProperty["step"],
                    onSet: new Callback(),
                };
                res[propKey] = temp;
                continue;
            }

            case "range": {
                const temp: PropertyInfoInternal<PropertyInfoRange> = {
                    type: "range",
                    label: origDataProperty["label"],
                    min: origDataProperty["min"],
                    max: origDataProperty["max"],
                    step: origDataProperty["step"],
                    onSet: new Callback(),
                };
                res[propKey] = temp;
                continue;
            }

            case "enum": {
                // ここやばポイント
                const temp = {
                    type: "enum",
                    label: origDataProperty["label"],
                    list: origDataProperty["list"],
                    onSet: new Callback(),
                };
                res[propKey] = temp;
                continue;
            }

            case "nest": {
                const temp: PropertyInfoInternal<PropertyInfoNest> = {
                    type: "nest",
                    label: origDataProperty["label"],
                    child: genPropertyInfoInternal(origDataProperty["child"]),
                };
                res[propKey] = temp;
                continue;
            }

            default: {
                consoleWrap.error("unknown dataProperty type", origDataProperty["type"]);
                throw new Error("unknown dataProperty type");
            }
        }
    }

    // ここどうにかしたい
    return <any>res;
}

function genDataGeterSeter<DATA_PROPERTY_INFO extends PropertyInfoList>(origData: PropertyData<DATA_PROPERTY_INFO>, dataPropertyInfo: PropertyInfoInternalList<DATA_PROPERTY_INFO>, saveFunc: () => void): { real: PropertyData<DATA_PROPERTY_INFO>, wrap: PropertyData<DATA_PROPERTY_INFO>, } {
    const real: { [key: string]: any } = {};
    const wrap = {};

    for (const propKey in dataPropertyInfo) {
        // ここやばポイント
        if (!((k: any): k is keyof DATA_PROPERTY_INFO => {
            return true;
        })(propKey)) {
            throw new Error("k is not KEYS");
        }

        // なんでundefinedになる可能性があるんやろ？
        const dataProperty = dataPropertyInfo[propKey];
        if (dataProperty == undefined) {
            consoleWrap.error("dataProperty == undefined");
            throw new Error("dataProperty == undefined");
        }

        switch (dataProperty["type"]) {
            case "boolean": {
                const origDataValue = origData[propKey];

                {
                    if (typeof origDataValue !== "boolean") {
                        consoleWrap.error("invalid origData", {
                            origData,
                            propKey,
                            origDataValueType: typeof origDataValue,
                            origDataValue,
                            dataProperty,
                        });
                        throw new Error("invalid origData");
                    }
                }

                real[propKey] = origDataValue;
                Object.defineProperty(wrap, propKey, {
                    get: () => {
                        consoleWrap.log("get", {
                            propKey,
                        });
                        return real[propKey];
                    },
                    set: (newValue: unknown) => {
                        const oldValue = real[propKey];
                        consoleWrap.log("set", {
                            propKey,
                            same: oldValue === newValue,
                            oldValue,
                            newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "boolean") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue,
                                oldValueType: typeof oldValue,
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (oldValue !== newValue) {
                            real[propKey] = newValue;
                            // ここ怪しいonSetが変
                            (dataProperty as any).onSet.exec(oldValue, <any>newValue);
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "string": {
                const origDataValue = origData[propKey];

                {
                    if (typeof origDataValue !== "string") {
                        consoleWrap.error("invalid origData", {
                            origData,
                            propKey,
                            origDataValueType: typeof origDataValue,
                            origDataValue,
                            dataProperty,
                        });
                        throw new Error("invalid origData");
                    }
                }

                real[propKey] = origDataValue;
                Object.defineProperty(wrap, propKey, {
                    get: () => {
                        consoleWrap.log("get", {
                            propKey,
                        });
                        return real[propKey];
                    },
                    set: (newValue: unknown) => {
                        const oldValue = real[propKey];
                        consoleWrap.log("set", {
                            propKey,
                            same: real[propKey] === newValue,
                            oldValue,
                            newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "string") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue,
                                oldValueType: typeof real[propKey],
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (oldValue !== newValue) {
                            real[propKey] = newValue;
                            // ここ怪しいonSetが変
                            (dataProperty as any).onSet.exec(oldValue, <any>newValue);
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "number":
            case "range": {
                {
                    if (!isPropertyInfoNumberOrRange(dataProperty)) {
                        consoleWrap.error("!isPropertyInfoNumberOrRange(dataProperty)", {
                            propKey,
                            dataProperty,
                        });
                        throw new Error("!isPropertyInfoNumberOrRange(dataProperty)");
                    }
                    if (dataProperty["min"] != undefined && dataProperty["max"] != undefined) {
                        if (dataProperty["min"] > dataProperty["max"]) {
                            consoleWrap.error("invalid dataProperty (min > max)", {
                                propKey,
                                dataProperty,
                            });
                            throw new Error("invalid dataProperty (min > max)");
                        }
                    }
                }

                let origDataValue = <unknown>origData[propKey];

                {
                    if (typeof origDataValue !== "number") {
                        consoleWrap.error("invalid origData", {
                            origData,
                            propKey,
                            origDataValueType: typeof origDataValue,
                            origDataValue,
                            dataProperty,
                        });
                        throw new Error("invalid origData");
                    }
                    {
                        const min = dataProperty["min"];
                        if (min != undefined) {
                            if (origDataValue < min) {
                                consoleWrap.error("out of range origDataValue", {
                                    origData,
                                    propKey,
                                    origDataValueType: typeof origDataValue,
                                    origDataValue,
                                    dataProperty,
                                });
                                throw new Error("out of range origDataValue");
                            }
                        }
                    }
                    {
                        const max = dataProperty["max"];
                        if (max != undefined) {
                            if (max < origDataValue) {
                                consoleWrap.error("out of range origDataValue", {
                                    origData,
                                    propKey,
                                    origDataValueType: typeof origDataValue,
                                    origDataValue,
                                    dataProperty,
                                });
                                throw new Error("out of range origDataValue");
                            }
                        }
                    }
                }

                real[propKey] = origDataValue;
                Object.defineProperty(wrap, propKey, {
                    get: () => {
                        consoleWrap.log("get", {
                            propKey,
                        });
                        return (real as any)[propKey];
                    },
                    set: (newValue) => {
                        const oldValue = real[propKey];
                        consoleWrap.log("set", {
                            propKey,
                            same: oldValue === newValue,
                            oldValue,
                            newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "number") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue,
                                oldValueType: typeof oldValue,
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (Number.isNaN(newValue)) {
                            consoleWrap.warn("Number.isNaN(newValue)", {
                                propKey,
                                oldValue,
                                oldValueType: typeof oldValue,
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            newValue = oldValue;
                        }
                        if (!Number.isFinite(newValue)) {
                            consoleWrap.warn("!Number.isFinite(newValue)", {
                                propKey,
                                oldValue,
                                oldValueType: typeof oldValue,
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            newValue = oldValue;
                        }
                        {
                            const min = dataProperty["min"];
                            if (min != undefined) {
                                if (newValue < min) {
                                    consoleWrap.warn("out of range newValue", {
                                        propKey,
                                        oldValue,
                                        oldValueType: typeof oldValue,
                                        newValue,
                                        newValueType: typeof newValue,
                                        dataProperty,
                                    });
                                    newValue = min;
                                }
                            }
                        }
                        {
                            const max = dataProperty["max"];
                            if (max != undefined) {
                                if (max < newValue) {
                                    consoleWrap.warn("out of range newValue", {
                                        propKey,
                                        oldValue: oldValue,
                                        oldValueType: typeof oldValue,
                                        newValue,
                                        newValueType: typeof newValue,
                                        dataProperty,
                                    });
                                    newValue = max;
                                }
                            }
                        }
                        if (oldValue !== newValue) {
                            real[propKey] = newValue;
                            // ここ怪しいonSetが変
                            (dataProperty as any).onSet.exec(oldValue, <any>newValue);
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "enum": {
                {
                    if (!isPropertyInfoEnum(dataProperty)) {
                        consoleWrap.error("!isPropertyInfoEnum(dataProperty)", {
                            propKey,
                            dataProperty,
                        });
                        throw new Error("!isPropertyInfoEnum(dataProperty)");
                    }
                }

                const origDataValue = origData[propKey];

                {
                    if (typeof origDataValue !== "string") {
                        consoleWrap.error("invalid origData", {
                            origData,
                            propKey,
                            origDataValueType: typeof origDataValue,
                            origDataValue,
                            dataProperty,
                        });
                        throw new Error("invalid origData");
                    }

                    if (!isEnumValue(origDataValue, dataProperty)) {
                        consoleWrap.error("invalid origData", {
                            origData,
                            propKey,
                            origDataValueType: typeof origDataValue,
                            origDataValue,
                            dataProperty,
                        });
                        continue;
                    }
                }

                real[propKey] = origDataValue;
                Object.defineProperty(wrap, propKey, {
                    get: () => {
                        consoleWrap.log("get", {
                            propKey,
                        });
                        return real[propKey];
                    },
                    set: (newValue) => {
                        const oldValue = real[propKey];
                        consoleWrap.log("set", {
                            propKey,
                            same: oldValue === newValue,
                            oldValue: oldValue,
                            newValue: newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "string") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: oldValue,
                                oldValueType: typeof oldValue,
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (!isEnumValue(newValue, dataProperty)) {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: oldValue,
                                oldValueType: typeof oldValue,
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (oldValue !== newValue) {
                            real[propKey] = newValue;
                            // ここ怪しいonSetが変
                            (dataProperty as any).onSet.exec(oldValue, <any>newValue);
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "nest": {
                {
                    if (!isPropertyInfoNest(dataProperty)) {
                        consoleWrap.error("!isPropertyInfoNest(dataProperty)", {
                            propKey,
                            dataProperty,
                        });
                        throw new Error("!isPropertyInfoNest(dataProperty)");
                    }
                }

                const origDataValue = origData[propKey];

                {
                    if (typeof origDataValue !== "object") {
                        consoleWrap.error("invalid origData", {
                            origData,
                            propKey,
                            origDataValueType: typeof origDataValue,
                            origDataValue,
                            dataProperty,
                        });
                        throw new Error("invalid origData");
                    }
                }

                try {
                    // ↓ここやばげ、簡単なチェックはするけど
                    const dataPropertyChildInfo = dataProperty["child"];
                    if (!(() => {
                        for (const key in <any>dataPropertyChildInfo) {
                            const info = dataPropertyChildInfo[key];
                            if (info == undefined) {
                                return false;
                            }
                            if (info["type"] == "nest") {
                                continue;
                            }
                            if ((info as any)["onSet"] == undefined) {
                                return false;
                            }
                        }

                        return true;
                    })()) {
                        consoleWrap.error("invalid dataProperty[child]", {
                            dataPropertyChildInfo
                        });
                        throw new Error("invalid dataProperty[child]");
                    }

                    const child = genDataGeterSeter(origDataValue, <any>dataPropertyChildInfo, saveFunc);
                    real[propKey] = child.real;
                    Object.defineProperty(wrap, propKey, {
                        get: () => {
                            consoleWrap.log("get", {
                                propKey,
                            });
                            return child.wrap;
                        },
                    });
                } catch (err) {
                    consoleWrap.error("invalid origData nest", {
                        origData,
                        propKey,
                        origDataValueType: typeof origDataValue,
                        origDataValue,
                        dataProperty,
                        nestError: err,
                    });
                    throw new Error("invalid origData");
                }
                continue;
            }

            default: {
                consoleWrap.error("unknown dataProperty type", dataProperty["type"]);
                throw new Error("unknown dataProperty type");
            }
        }
    }

    // ここどうにかしたい
    return {
        real: <any>real,
        wrap: <any>wrap,
    };
}

function isDataPropertyKey<DATA_PROPERTY_INFO extends PropertyInfoList>(key: any, dataPropertyInfo: DATA_PROPERTY_INFO): key is keyof DATA_PROPERTY_INFO {
    for (const k in dataPropertyInfo) {
        if (key === k) {
            return true;
        }
    }

    const keyExpectList: string[] = [];
    for (const k in dataPropertyInfo) {
        keyExpectList.push(k);
    }
    consoleWrap.warn("isDataPropertyKey fail", {
        keyIn: key,
        keyExpectList: keyExpectList,
    });
    return false;
};

function isEnumValue<DATA_PROPERTY_INFO extends PropertyInfoEnum>(value: string, dataPropertyInfo: DATA_PROPERTY_INFO): value is PropertyDataEnum<DATA_PROPERTY_INFO["list"]> {
    if (!isPropertyInfoEnum(dataPropertyInfo)) {
        consoleWrap.error("!isPropertyInfoEnum(dataPropertyInfo)", {
            dataPropertyInfo,
        });
        throw new Error("invalid origData");
    }

    for (const e of dataPropertyInfo["list"]) {
        if (value === e.value) {
            return true;
        }
    }

    consoleWrap.warn("isEnumValue fail", {
        enumIn: value,
        enumExpectList: dataPropertyInfo["list"],
    });
    return false;
};
