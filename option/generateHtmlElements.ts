import { ConsoleWrap } from "../console/ConsoleWrap.js";
import type { exEvent } from "../html/exEvents.js";
import { isDataPropertyKey, isEnumValue, OptionBase } from "./OptionBase.js";
import { isPropertyInfoEnum, isPropertyInfoNumberOrRange, type PropertyData, type PropertyHtml, type PropertyInfoList, type PropertyInfoInternalList, type PropertyPrimitiveMap, isPropertyInfoList } from "./type.js";

export { generateHtmlElements };

const consoleWrap = new ConsoleWrap();
export const generateHtmlElementsConsoleOption = consoleWrap.enables;

function generateHtmlElements<DATA_PROPERTY_INFO extends PropertyInfoList>(opt: OptionBase<DATA_PROPERTY_INFO>): PropertyHtml<DATA_PROPERTY_INFO> {
    return _generateHtmlElements(opt.data, opt.dataPropertyInfo);
}

function _generateHtmlElements<DATA_PROPERTY_INFO extends PropertyInfoList>(data: PropertyData<DATA_PROPERTY_INFO>, dataPropertyInfo: PropertyInfoInternalList<DATA_PROPERTY_INFO>): PropertyHtml<DATA_PROPERTY_INFO> {
    if (!isPropertyInfoList(dataPropertyInfo)) {
        throw new Error("!isPropertyInfoList(dataPropertyInfo)");
    }

    const handlerList: { [key in keyof PropertyPrimitiveMap | "enum"]: EventListenerObject } = {
        "boolean": {
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
                    } catch (e) {
                        consoleWrap.error(e);
                    }

                    checkbox.readOnly = false;
                },
        },
        "string": {
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
                    } catch (e) {
                        consoleWrap.error(e);
                    }

                    input.readOnly = false;
                },
        },
        "number": {
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
                        // 多分大丈夫だけどいつか改善したい
                        (data as any)[key] = val;
                    } catch (e) {
                        consoleWrap.error(e);
                    }

                    input.readOnly = false;
                },
        },
        "range": {
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
                        // 多分大丈夫だけどいつか改善したい
                        (data as any)[key] = val;
                    } catch (e) {
                        consoleWrap.error(e);
                    }

                    input.readOnly = false;
                },
        },
        "enum": {
            handleEvent:
                async (e: exEvent<HTMLSelectElement>) => {
                    if (e.currentTarget == null) {
                        throw new Error("e.currentTarget == null");
                    }

                    const select = e.currentTarget;

                    try {
                        const key = select.dataset["key"];
                        if (!isDataPropertyKey(key, dataPropertyInfo)) {
                            throw new Error("!this.isDataPropertyKey(key)");
                        }
                        const val = select.value;
                        const dataPropertyInfoEnum = dataPropertyInfo[key];
                        if (!isPropertyInfoEnum(dataPropertyInfoEnum)) {
                            consoleWrap.error("!isPropertyInfoEnum(dataPropertyInfoEnum)", {
                                key,
                                dataPropertyInfo,
                            });
                            throw new Error("!isPropertyInfoEnum(dataPropertyInfoEnum)");
                        }
                        if (!isEnumValue(val, dataPropertyInfoEnum)) {
                            throw new Error("!this.isEnumValue(val)");
                        }
                        // 多分大丈夫だけどいつか改善したい
                        (data as any)[key] = val;
                    } catch (e) {
                        consoleWrap.error(e);
                    }
                },
        },
    };

    const resHtml: Partial<PropertyHtml<DATA_PROPERTY_INFO>> = {};

    for (const key in dataPropertyInfo) {
        // ここやばポイント
        if (!((k: any): k is keyof PropertyData<DATA_PROPERTY_INFO> => {
            return true;
        })(key)) {
            throw new Error("k is not KEYS");
        }

        const p = dataPropertyInfo[key];
        const d = data[key];

        // なんでundefinedになる可能性があるんやろ？
        if (p?.type == undefined || p.label == undefined) {
            throw new Error("p?.type == undefined || p.label == undefined");
        }

        switch (p.type) {
            case "boolean": {
                const val = d;
                if (typeof val !== "boolean") {
                    consoleWrap.error("typeof val !== boolean");
                    throw new Error("typeof val !== boolean");
                }

                const resHtmlTemp: Partial<PropertyHtml<DATA_PROPERTY_INFO>[keyof DATA_PROPERTY_INFO]> = {};
                resHtmlTemp.type = p.type;
                {
                    const span = document.createElement("span");
                    resHtmlTemp.labelElem = span;
                    {
                        span.classList.add("label");
                        span.textContent = p.label;
                    }
                }
                {
                    {
                        const checkbox = document.createElement("input");
                        resHtmlTemp.valueElem = checkbox;
                        {
                            checkbox.classList.add("value");
                            checkbox.dataset["key"] = key;
                            checkbox.type = "checkbox";
                            checkbox.checked = val;
                            checkbox.addEventListener("click", handlerList["boolean"]);
                            // ここ怪しい
                            (dataPropertyInfo[key] as any).onSet.addListener((v: unknown) => {
                                checkbox.checked = <any>v;
                            });
                        }
                    }
                }

                // ここ怪しい
                (resHtml as any)[key] = resHtmlTemp;
                break;
            }

            case "string": {
                const val = d;
                if (typeof val !== "string") {
                    consoleWrap.error("typeof val !== string");
                    throw new Error("typeof val !== string");
                }

                const resHtmlTemp: Partial<PropertyHtml<DATA_PROPERTY_INFO>[keyof DATA_PROPERTY_INFO]> = {};
                resHtmlTemp.type = p.type;
                {
                    {
                        const span = document.createElement("span");
                        resHtmlTemp.labelElem = span;
                        {
                            span.classList.add("label");
                            span.textContent = p.label;
                        }
                    }
                    {
                        const input = document.createElement("input");
                        resHtmlTemp.valueElem = input;
                        {
                            input.classList.add("value");
                            input.dataset["key"] = key;
                            input.type = "text";
                            input.value = val;
                            input.addEventListener("change", handlerList["string"]);
                            // ここ怪しい
                            (dataPropertyInfo[key] as any).onSet.addListener((v: unknown) => {
                                input.value = <any>v;
                            });
                        }
                    }
                }

                // ここ怪しい
                (resHtml as any)[key] = resHtmlTemp;
                break;
            }

            case "number":
            case "range": {
                if (!isPropertyInfoNumberOrRange(p)) {
                    consoleWrap.error("!isPropertyInfoNumberOrRange(dataProperty)", {
                        dataProperty: p,
                    });
                    throw new Error("!isPropertyInfoNumberOrRange(dataProperty)");
                }

                const val = d;
                if (typeof val !== "number") {
                    consoleWrap.error("typeof val !== number");
                    throw new Error("typeof val !== number");
                }

                const resHtmlTemp: Partial<PropertyHtml<DATA_PROPERTY_INFO>[keyof DATA_PROPERTY_INFO]> = {};
                resHtmlTemp.type = p.type;
                {
                    {
                        const span = document.createElement("span");
                        resHtmlTemp.labelElem = span;
                        {
                            span.classList.add("label");
                            span.textContent = p.label;
                        }
                    }
                    {
                        const input = document.createElement("input");
                        resHtmlTemp.valueElem = input;
                        {
                            input.classList.add("value");
                            input.dataset["key"] = key;
                            switch (p.type) {
                                case "number": {
                                    input.type = "number";
                                    break;
                                }
                                case "range": {
                                    input.type = "range";
                                    break;
                                }

                                default:
                                    throw new Error("why?");
                            }
                            input.value = String(val);
                            if (p.min != undefined) {
                                input.min = String(p.min);
                            }
                            if (p.max != undefined) {
                                input.max = String(p.max);
                            }
                            if (p.step != undefined) {
                                input.step = String(p.step);
                            }
                            switch (p.type) {
                                case "number": {
                                    input.addEventListener("change", handlerList["number"]);
                                    break;
                                }
                                case "range": {
                                    input.addEventListener("input", handlerList["range"]);
                                    break;
                                }

                                default:
                                    throw new Error("why?");
                            }
                            // ここ怪しい
                            (dataPropertyInfo[key] as any).onSet.addListener((v: unknown) => {
                                input.value = <any>String(v);
                            });
                        }
                    }
                }

                // ここ怪しい
                (resHtml as any)[key] = resHtmlTemp;
                break;
            }

            case "enum": {
                const val = d;
                if (typeof val !== "string") {
                    consoleWrap.error("typeof val !== string");
                    throw new Error("typeof val !== string");
                }

                const resHtmlTemp: Partial<PropertyHtml<DATA_PROPERTY_INFO>[keyof DATA_PROPERTY_INFO]> = {};
                resHtmlTemp.type = p.type;
                {
                    {
                        const span = document.createElement("span");
                        resHtmlTemp.labelElem = span;
                        {
                            span.classList.add("label");
                            span.textContent = p.label;
                        }
                    }
                    {
                        const select = document.createElement("select");
                        resHtmlTemp.valueElem = select;
                        {
                            select.classList.add("value");
                            select.dataset["key"] = key;
                            {
                                const dataPropertyInfoEnum = dataPropertyInfo[key];
                                if (dataPropertyInfoEnum == undefined) {
                                    consoleWrap.error("dataPropertyInfoEnum == undefined");
                                    throw new Error("dataPropertyInfoEnum == undefined");
                                }
                                if (dataPropertyInfoEnum.type !== "enum") {
                                    consoleWrap.error("dataPropertyInfoEnum.type !== enum");
                                    throw new Error("dataPropertyInfoEnum.type !== enum");
                                }
                                // ここやばポイント
                                const dataPropertyInfoEnumList = (<any>dataPropertyInfoEnum)["list"];

                                for (const e of dataPropertyInfoEnumList) {
                                    const option = document.createElement("option");
                                    select.appendChild(option);
                                    option.textContent = e.label;
                                    option.value = e.value;
                                }
                            }
                            select.value = val;
                            select.addEventListener("change", handlerList["enum"]);
                            // ここ怪しい
                            (dataPropertyInfo[key] as any).onSet.addListener((v: unknown) => {
                                select.value = <any>v;
                            });
                        }
                    }
                }

                // ここ怪しい
                (resHtml as any)[key] = resHtmlTemp;
                break;
            }

            case "nest": {
                const resHtmlTemp: Partial<PropertyHtml<DATA_PROPERTY_INFO>[keyof DATA_PROPERTY_INFO]> = {};
                resHtmlTemp.type = p.type;
                {
                    {
                        const span = document.createElement("span");
                        resHtmlTemp.labelElem = span;
                        {
                            span.classList.add("label");
                            span.textContent = p.label;
                        }
                    }
                    {
                        const dataPropertyInfoChild = dataPropertyInfo[key];
                        if (dataPropertyInfoChild == undefined) {
                            consoleWrap.error("dataPropertyInfoChild == undefined");
                            throw new Error("dataPropertyInfoChild == undefined");
                        }
                        if (dataPropertyInfoChild.type !== "nest") {
                            consoleWrap.error("dataPropertyInfoChild.type !== nest");
                            throw new Error("dataPropertyInfoChild.type !== nest");
                        }
                        // ここやばポイント
                        const dataPropertyInfoChildInfo = (<any>dataPropertyInfoChild)["child"];
                        if (dataPropertyInfoChildInfo == undefined) {
                            consoleWrap.error("dataPropertyInfoChildInfo == undefined");
                            throw new Error("dataPropertyInfoChildInfo == undefined");
                        }

                        // dがnestの時の型が欠落するのはなんでじゃろか
                        if (typeof d !== "object") {
                            consoleWrap.error("nest error", { data: d, });
                            throw new Error("nest data is not object");
                        }

                        // ここ怪しい
                        (resHtmlTemp as any).child = _generateHtmlElements(d, dataPropertyInfoChildInfo);
                    }
                }

                // ここ怪しい
                (resHtml as any)[key] = resHtmlTemp;
                break;
            }

            default: {
                consoleWrap.error("unknown p.type", p);
                throw new Error("unknown p.type");
            }
        }
    }

    // ここ怪しい
    return <any>resHtml;
}
