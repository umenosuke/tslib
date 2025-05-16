import { ConsoleWrap } from "../console/ConsoleWrap.js";
import type { tJson } from "../data/typeJson.js";
import { TokenBucket } from "../time/TokenBucket.js";
import type { RecursivePartial } from "../type/RecursivePartial.js";
import type { PropertyData, PropertyDataEnum, PropertyInfo, PropertyInfoEnum } from "./type.js";

export { OptionBase, isDataPropertyKey, isEnumValue };

const consoleWrap = new ConsoleWrap();
export const OptionBaseConsoleOption = consoleWrap.enables;

class OptionBase<DATA_PROPERTY_INFO extends PropertyInfo> {
    public readonly dataPropertyInfo: DATA_PROPERTY_INFO;
    public readonly data: PropertyData<DATA_PROPERTY_INFO>;
    public readonly dataReal: PropertyData<DATA_PROPERTY_INFO>;

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
        this.dataPropertyInfo = dataPropertyInfo;
        {
            const d = genGetSet(defaultData, () => {
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
            case "number":
            case "string":
            case "boolean": {
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
                if (dataPropertyInfoEnum == undefined) {
                    consoleWrap.error("dataPropertyInfoEnum == undefined");
                    throw new Error("dataPropertyInfoEnum == undefined");
                }
                if (dataPropertyInfoEnum.type !== "enum") {
                    consoleWrap.error("dataPropertyInfoEnum.type !== enum");
                    throw new Error("dataPropertyInfoEnum.type !== enum");
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

                const dataPropertyInfoChildInfo = dataPropertyInfo[key]?.["child"];
                if (dataPropertyInfoChildInfo == undefined) {
                    consoleWrap.error("dataPropertyInfoChildInfo == undefined");
                    throw new Error("dataPropertyInfoChildInfo == undefined");
                }

                // toData[key]がnestの時の型が欠落するのはなんでじゃろか
                if (typeof toData[key] !== "object") {
                    consoleWrap.error("nest error", { data: toData[key], });
                    throw new Error("nest data is not object");
                }

                const nestRes = setData(fromData[key], toData[key], dataPropertyInfoChildInfo);
                if (nestRes.changed) {
                    res.changed = true;
                }
                if (nestRes.containsInvalidData) {
                    consoleWrap.warn("nestRes contains invalid data", {
                        dataIn: fromData,
                        key: key,
                        dataVal: fromData[key],
                        dataExpectType: dataPropertyInfoChildInfo,
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
function genGetSet<T extends {}>(d: T, saveFunc: () => void): { real: T, wrap: T, } {
    const real: { [key: string]: any } = {};
    const wrap = {};

    Object.keys(d).forEach((prop) => {
        const val = (d as any)[prop];
        if (typeof val !== "object") {
            real[prop] = val;
            Object.defineProperty(wrap, prop, {
                get: () => {
                    consoleWrap.log("get", {
                        name: prop,
                    });
                    return (real as any)[prop];
                },
                set: (newValue) => {
                    consoleWrap.log("set", {
                        name: prop,
                        same: (real as any)[prop] === newValue,
                        oldValue: (real as any)[prop],
                        newValue: newValue,
                    });
                    if ((real as any)[prop] !== newValue) {
                        (real as any)[prop] = newValue;
                        saveFunc();
                    }
                },
            });
        } else {
            const nest = genGetSet(val, saveFunc);
            real[prop] = nest.real;
            Object.defineProperty(wrap, prop, {
                get: () => {
                    consoleWrap.log("get nest", prop);
                    return nest.wrap;
                },
            });
            consoleWrap.log({ real, wrap, });
        }
    });

    return {
        real: <T>real,
        wrap: <T>wrap,
    };
}

function isDataPropertyKey<DATA_PROPERTY_INFO extends PropertyInfo>(key: any, dataPropertyInfo: DATA_PROPERTY_INFO): key is keyof DATA_PROPERTY_INFO {
    for (const k in dataPropertyInfo) {
        if (key === k) {
            return true;
        }
    }

    const keyExpectList: any[] = [];
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
