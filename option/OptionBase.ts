import { ConsoleWrap } from "../console/ConsoleWrap.js";
import type { tJson } from "../data/typeJson.js";
import { TokenBucket } from "../time/TokenBucket.js";
import type { RecursivePartial } from "../type/RecursivePartial.js";
import { isPropertyInfo, isPropertyInfoEnum, isPropertyInfoNest, type PropertyData, type PropertyDataEnum, type PropertyInfo, type PropertyInfoEnum, type PropertyInfoInternal } from "./type.js";

export { OptionBase, isDataPropertyKey, isEnumValue };

const consoleWrap = new ConsoleWrap();
export const OptionBaseConsoleOption = consoleWrap.enables;

class OptionBase<DATA_PROPERTY_INFO extends PropertyInfo> {
    public readonly dataPropertyInfo: PropertyInfoInternal<DATA_PROPERTY_INFO>;
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
            // todo
            this.dataPropertyInfo = <any>dataPropertyInfo;
        }
        {
            const d = genDataGeterSeter(defaultData, dataPropertyInfo, () => {
                if (this.opt.saveOnChanged) {
                    this.save();
                }
            });
            this.data = d.wrap;
            this.dataReal = d.real;
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
                const dataPropertyInfo = <unknown>this.dataPropertyInfo;
                if (!isPropertyInfo(dataPropertyInfo)) {
                    throw new Error("!isPropertyInfo(dataPropertyInfo)");
                }
                const setRes = setData(loadData, this.data, dataPropertyInfo);
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
            const dataPropertyInfo = <unknown>this.dataPropertyInfo;
            if (!isPropertyInfo(dataPropertyInfo)) {
                throw new Error("!isPropertyInfo(dataPropertyInfo)");
            }
            const setRes = setData(fromData, this.data, dataPropertyInfo);
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

function setData<DATA_PROPERTY_INFO extends PropertyInfo>(fromData: any, toData: PropertyData<DATA_PROPERTY_INFO>, dataPropertyInfo: DATA_PROPERTY_INFO): ({
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
                    toData[key] = fromData[key];
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
                    toData[key] = <any>fromData[key];
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

                const nestRes = setData(fromData[key], toData[key], dataPropertyInfoNest["child"]);
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

// セット時にコールバックを注入するテスト中
function genDataGeterSeter<DATA_PROPERTY_INFO extends PropertyInfo>(origData: PropertyData<DATA_PROPERTY_INFO>, dataPropertyInfo: DATA_PROPERTY_INFO, saveFunc: () => void): { real: PropertyData<DATA_PROPERTY_INFO>, wrap: PropertyData<DATA_PROPERTY_INFO>, } {
    const real: { [key: string]: any } = {};
    const wrap = {};

    for (const propKey in dataPropertyInfo) {
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
                    set: (newValue) => {
                        consoleWrap.log("set", {
                            propKey,
                            same: real[propKey] === newValue,
                            oldValue: real[propKey],
                            newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "boolean") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: real[propKey],
                                oldValueType: typeof real[propKey],
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (real[propKey] !== newValue) {
                            real[propKey] = newValue;
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
                    set: (newValue) => {
                        consoleWrap.log("set", {
                            propKey,
                            same: real[propKey] === newValue,
                            oldValue: real[propKey],
                            newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "string") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: real[propKey],
                                oldValueType: typeof real[propKey],
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (real[propKey] !== newValue) {
                            real[propKey] = newValue;
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "number":
            case "range": {
                {
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
                        consoleWrap.log("set", {
                            propKey,
                            same: (real as any)[propKey] === newValue,
                            oldValue: (real as any)[propKey],
                            newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "number") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: real[propKey],
                                oldValueType: typeof real[propKey],
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        {
                            const min = dataProperty["min"];
                            if (min != undefined) {
                                if (newValue < min) {
                                    consoleWrap.warn("out of range newValue", {
                                        propKey,
                                        oldValue: real[propKey],
                                        oldValueType: typeof real[propKey],
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
                                        oldValue: real[propKey],
                                        oldValueType: typeof real[propKey],
                                        newValue,
                                        newValueType: typeof newValue,
                                        dataProperty,
                                    });
                                    newValue = max;
                                }
                            }
                        }
                        if (real[propKey] !== newValue) {
                            real[propKey] = newValue;
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "enum": {
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
                        consoleWrap.log("set", {
                            propKey,
                            same: real[propKey] === newValue,
                            oldValue: real[propKey],
                            newValue: newValue,
                            dataProperty,
                        });
                        if (typeof newValue !== "string") {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: real[propKey],
                                oldValueType: typeof real[propKey],
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (!isEnumValue(newValue, dataProperty)) {
                            consoleWrap.error("invalid newValue", {
                                propKey,
                                oldValue: real[propKey],
                                oldValueType: typeof real[propKey],
                                newValue,
                                newValueType: typeof newValue,
                                dataProperty,
                            });
                            throw new Error("invalid newValue");
                        }
                        if (real[propKey] !== newValue) {
                            real[propKey] = newValue;
                            saveFunc();
                        }
                    },
                });
                continue;
            }

            case "nest": {
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
                    const dataPropertyChildInfo = dataProperty["child"];

                    const child = genDataGeterSeter(origDataValue, dataPropertyChildInfo, saveFunc);
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

function isDataPropertyKey<DATA_PROPERTY_INFO extends PropertyInfo>(key: any, dataPropertyInfo: DATA_PROPERTY_INFO): key is keyof DATA_PROPERTY_INFO {
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
