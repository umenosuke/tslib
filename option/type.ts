import { ConsoleWrap } from "../console/ConsoleWrap.js";

export { };

const consoleWrap = new ConsoleWrap();
export const OptionBaseTypeConsoleOption = consoleWrap.enables;

export type PropertyInfo = Record<string,
    PropertyInfoBoolean
    | PropertyInfoString
    | PropertyInfoNumber
    | PropertyInfoRange
    | PropertyInfoEnum
    | PropertyInfoNest
>;
export type PropertyInfoBoolean = Readonly<{
    "type": "boolean",
    "label": string,
}>;
export type PropertyInfoString = Readonly<{
    "type": "string",
    "label": string,
}>;
export type PropertyInfoNumber = Readonly<{
    "type": "number",
    "label": string,
    "min"?: number,
    "max"?: number,
    "step"?: number,
}>;
export type PropertyInfoRange = Readonly<{
    "type": "range",
    "label": string,
    "min"?: number,
    "max"?: number,
    "step"?: number,
}>;
export type PropertyInfoEnum = Readonly<{
    "type": "enum",
    "label": string,
    "list": readonly Readonly<{
        "label": string,
        "value": string,
    }>[],
}>;
export type PropertyInfoNest = Readonly<{
    "type": "nest",
    "label": string,
    "child": PropertyInfo,
}>;
export type PropertyPrimitiveMap = Readonly<{
    "boolean": boolean,
    "string": string,
    "number": number,
    "range": number,
}>;

export type PropertyInfoInternal<PROPERTY_INFO extends PropertyInfo> = {
    readonly [K in keyof PROPERTY_INFO]: (
        PROPERTY_INFO[K]["type"] extends keyof PropertyPrimitiveMap
        ? Readonly<PROPERTY_INFO[K] & { "onSet": Callback<PropertyPrimitiveMap[PROPERTY_INFO[K]["type"]]>, }>
        : (
            PROPERTY_INFO[K]["type"] extends "enum"
            ? (
                PROPERTY_INFO[K] extends PropertyInfoEnum
                ? PropertyInfoInternalEnum<PROPERTY_INFO[K]>
                : never
            )
            : (
                PROPERTY_INFO[K]["type"] extends "nest"
                ? (PROPERTY_INFO[K] extends { "child": infer CHILD }
                    ? (CHILD extends PropertyInfo
                        ? Readonly<{
                            "type": "nest",
                            "label": string,
                            "child": PropertyInfoInternal<CHILD>,
                        }>
                        : never
                    )
                    : never
                )
                : never
            )
        )
    )
};
export type PropertyInfoInternalEnum<E extends PropertyInfoEnum> = (
    E extends { "list": infer PROPERTY_INFO_ENUM_LIST }
    ? (
        PROPERTY_INFO_ENUM_LIST extends readonly { "value": infer PROPERTY_INFO_ENUM_LIST_VALUE, }[]
        ? (
            string extends PROPERTY_INFO_ENUM_LIST_VALUE
            ? never
            : Readonly<E & { "onSet": Callback<PROPERTY_INFO_ENUM_LIST_VALUE>, }>
        )
        : never
    )
    : never
);
class Callback<T> {
    private callBackList: Map<string, (oldValue: T, newValue: T) => void>;

    constructor() {
        this.callBackList = new Map();
    }

    public addListener(callback: (oldValue: T, newValue: T) => void): string {
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
                callBack(oldValue, newValue);
            } catch (err) {
                consoleWrap.error("Callback exec fail", {
                    id,
                    err,
                });
            }
        }
    }
}

export type PropertyData<PROPERTY_INFO extends PropertyInfo> = PropertyDataPropertyRoRw<{
    [K in keyof PROPERTY_INFO]: (
        PROPERTY_INFO[K]["type"] extends keyof PropertyPrimitiveMap
        ? ({
            readonly: false,
            value: PropertyPrimitiveMap[PROPERTY_INFO[K]["type"]],
        })
        : (PROPERTY_INFO[K]["type"] extends "enum"
            ? (PROPERTY_INFO[K] extends { "list": infer PROPERTY_INFO_ENUM_LIST }
                ? (PROPERTY_INFO_ENUM_LIST extends readonly { "value": string, }[]
                    ? ({
                        readonly: false,
                        value: PropertyDataEnum<PROPERTY_INFO_ENUM_LIST>,
                    })
                    : never
                )
                : never
            )
            : (PROPERTY_INFO[K]["type"] extends "nest"
                ? (PROPERTY_INFO[K] extends { "child": infer CHILD }
                    ? (CHILD extends PropertyInfo
                        ? ({
                            readonly: true,
                            value: PropertyData<CHILD>,
                        })
                        : never
                    )
                    : never
                )
                : never
            )
        )
    )
}>;
export type PropertyDataEnum<LIST extends readonly { "value": string, }[]> = (
    LIST extends readonly { "value": infer PROPERTY_INFO_ENUM_LIST_VALUE, }[]
    ? (
        string extends PROPERTY_INFO_ENUM_LIST_VALUE
        ? never
        : PROPERTY_INFO_ENUM_LIST_VALUE
    )
    : never
);
type PropertyDataPropertyRoRw<T extends Record<string, { readonly: boolean, value: unknown, }>> = {
    [K in keyof T as T[K]["readonly"] extends false ? K : never]: T[K]["value"]
} & {
    readonly [K in keyof T as T[K]["readonly"] extends true ? K : never]: T[K]["value"]
};

export type PropertyHtml<PROPERTY_INFO extends PropertyInfo> = {
    [K in keyof PROPERTY_INFO]: (
        PROPERTY_INFO[K]["type"] extends keyof PropertyPrimitiveMap
        ? ({
            type: PROPERTY_INFO[K]["type"],
            labelElem: HTMLSpanElement,
            valueElem: HTMLInputElement,
        })
        : (PROPERTY_INFO[K]["type"] extends "enum"
            ? ({
                type: PROPERTY_INFO[K]["type"],
                labelElem: HTMLSpanElement,
                valueElem: HTMLSelectElement,
            })
            : (PROPERTY_INFO[K]["type"] extends "nest"
                ? (PROPERTY_INFO[K] extends { "child": infer CHILD }
                    ? (CHILD extends PropertyInfo
                        ? ({
                            type: PROPERTY_INFO[K]["type"],
                            labelElem: HTMLSpanElement,
                            childElem: PropertyHtml<CHILD>,
                        })
                        : never
                    )
                    : never
                )
                : never
            )
        )
    )
};

export function isPropertyInfo(info: any): info is PropertyInfo {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    switch (info.type) {
        case "boolean": {
            return isPropertyInfoBoolean(info);
        }

        case "string": {
            return isPropertyInfoString(info);
        }

        case "number": {
            return isPropertyInfoNumber(info);
        }

        case "range": {
            return isPropertyInfoRange(info);
        }

        case "enum": {
            return isPropertyInfoEnum(info);
        }

        case "nest": {
            return isPropertyInfoNest(info);
        }

        default: {
            throw new Error("unknown info.type");
        }
    }
}
export function isPropertyInfoBoolean(info: any): info is PropertyInfoBoolean {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "boolean") {
        return false;
    }

    if (typeof info.label !== "string") {
        return false;
    }

    return true;
}
export function isPropertyInfoString(info: any): info is PropertyInfoString {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "string") {
        return false;
    }

    if (typeof info.label !== "string") {
        return false;
    }

    return true;
}
export function isPropertyInfoNumber(info: any): info is PropertyInfoNumber {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "number") {
        return false;
    }

    if (typeof info.label !== "string") {
        return false;
    }

    if (info.min != undefined) {
        if (typeof info.min !== "number") {
            return false;
        }
    }

    if (info.max != undefined) {
        if (typeof info.max !== "number") {
            return false;
        }
    }

    if (info.step != undefined) {
        if (typeof info.step !== "number") {
            return false;
        }
    }

    return true;
}
export function isPropertyInfoRange(info: any): info is PropertyInfoRange {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "range") {
        return false;
    }

    if (typeof info.label !== "string") {
        return false;
    }

    if (info.min != undefined) {
        if (typeof info.min !== "number") {
            return false;
        }
    }

    if (info.max != undefined) {
        if (typeof info.max !== "number") {
            return false;
        }
    }

    if (info.step != undefined) {
        if (typeof info.step !== "number") {
            return false;
        }
    }

    return true;
}
export function isPropertyInfoEnum(info: any): info is PropertyInfoEnum {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "enum") {
        return false;
    }

    if (typeof info.label !== "string") {
        return false;
    }

    if (typeof info.list !== "object") {
        return false;
    }
    if (!Array.isArray(info.list)) {
        return false;
    }
    for (const l of info.list) {
        if (typeof l.label !== "string") {
            return false;
        }

        if (typeof l.value !== "string") {
            return false;
        }
    }

    return true;
}
export function isPropertyInfoNest(info: any): info is PropertyInfoNest {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "nest") {
        return false;
    }

    if (typeof info.label !== "string") {
        return false;
    }

    if (!isPropertyInfo(info.child)) {
        return false;
    }

    return true;
}
