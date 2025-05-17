import { ConsoleWrap } from "../console/ConsoleWrap.js";
import type { Callback } from "./OptionBase.js";

export { };

const consoleWrap = new ConsoleWrap();
export const OptionBaseTypeConsoleOption = consoleWrap.enables;

export type PropertyInfoList = Record<string, PropertyInfo>;
export type PropertyInfo = (
    PropertyInfoBoolean
    | PropertyInfoString
    | PropertyInfoNumber
    | PropertyInfoRange
    | PropertyInfoEnum
    | PropertyInfoNest
);
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
    "child": PropertyInfoList,
}>;
export type PropertyPrimitiveMap = Readonly<{
    "boolean": boolean,
    "string": string,
    "number": number,
    "range": number,
}>;

export type PropertyInfoInternalList<PROPERTY_INFO_LIST extends PropertyInfoList> = {
    readonly [K in keyof PROPERTY_INFO_LIST]: PropertyInfoInternal<PROPERTY_INFO_LIST[K]>
};
export type PropertyInfoInternal<PROPERTY_INFO extends PropertyInfo> = (
    PROPERTY_INFO["type"] extends keyof PropertyPrimitiveMap
    ? Readonly<PROPERTY_INFO & { "onSet": Callback<PropertyPrimitiveMap[PROPERTY_INFO["type"]]>, }>
    : (
        PROPERTY_INFO["type"] extends "enum"
        ? (
            PROPERTY_INFO extends PropertyInfoEnum
            ? PropertyInfoInternalEnum<PROPERTY_INFO>
            : never
        )
        : (
            PROPERTY_INFO["type"] extends "nest"
            ? (PROPERTY_INFO extends { "child": infer CHILD }
                ? (CHILD extends PropertyInfoList
                    ? Readonly<{
                        "type": "nest",
                        "label": string,
                        "child": PropertyInfoInternalList<CHILD>,
                    }>
                    : never
                )
                : never
            )
            : never
        )
    )
);
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

export type PropertyData<PROPERTY_INFO extends PropertyInfoList> = PropertyDataPropertyRoRw<{
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
                    ? (CHILD extends PropertyInfoList
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

export type PropertyHtml<PROPERTY_INFO extends PropertyInfoList> = {
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
                    ? (CHILD extends PropertyInfoList
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

export function isPropertyInfoList(info: any): info is PropertyInfoList {
    if (info == undefined) {
        consoleWrap.warn("isPropertyInfoList", {
            msg: "info == undefined",
            info,
        });
        return false;
    }

    if (typeof info !== "object") {
        consoleWrap.warn("isPropertyInfoList", {
            msg: "typeof info !== object",
            info,
        });
        return false;
    }

    for (const key in info) {
        if (typeof key !== "string") {
            consoleWrap.warn("isPropertyInfoList", {
                msg: "typeof key !== string",
                info,
                key,
            });
            return false;
        }

        if (!isPropertyInfo(info[key])) {
            consoleWrap.warn("isPropertyInfoList", {
                msg: "!isPropertyInfo(info[key])",
                info,
                key,
            });
            return false;
        }
    }

    return true;
}
export function isPropertyInfo(info: any): info is PropertyInfo {
    if (info == undefined) {
        consoleWrap.warn("isPropertyInfo", {
            msg: "info == undefined",
            info,
        });
        return false;
    }

    if (typeof info.type !== "string") {
        consoleWrap.warn("isPropertyInfo", {
            msg: "typeof info.type !== string",
            info,
        });
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
        consoleWrap.warn("isPropertyInfoBoolean", {
            msg: "info == undefined",
            info,
        });
        return false;
    }

    if (typeof info.type !== "string") {
        consoleWrap.warn("isPropertyInfoBoolean", {
            msg: "typeof info.type !== string",
            info,
        });
        return false;
    }
    if (info.type !== "boolean") {
        consoleWrap.warn("isPropertyInfoBoolean", {
            msg: "info.type !== boolean",
            info,
        });
        return false;
    }

    if (typeof info.label !== "string") {
        consoleWrap.warn("isPropertyInfoBoolean", {
            msg: "typeof info.label !== string",
            info,
        });
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
export function isPropertyInfoNumberOrRange(info: any): info is (PropertyInfoNumber | PropertyInfoRange) {
    if (info == undefined) {
        return false;
    }

    if (typeof info.type !== "string") {
        return false;
    }
    if (info.type !== "number" && info.type !== "range") {
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
export function isPropertyInfoNumber(info: any): info is PropertyInfoNumber {
    if (info == undefined) {
        consoleWrap.warn("isPropertyInfoNumber", {
            msg: "info == undefined",
            info,
        });
        return false;
    }

    if (!isPropertyInfoNumberOrRange(info)) {
        consoleWrap.warn("isPropertyInfoNumber", {
            msg: "!isPropertyInfoNumberOrRange(info)",
            info,
        });
        return false;
    }

    if (info.type !== "number") {
        consoleWrap.warn("isPropertyInfoNumber", {
            msg: "info.type !== number",
            info,
        });
        return false;
    }

    return true;
}
export function isPropertyInfoRange(info: any): info is PropertyInfoRange {
    if (info == undefined) {
        consoleWrap.warn("isPropertyInfoRange", {
            msg: "info == undefined",
            info,
        });
        return false;
    }

    if (!isPropertyInfoNumberOrRange(info)) {
        consoleWrap.warn("isPropertyInfoRange", {
            msg: "!isPropertyInfoNumberOrRange(info)",
            info,
        });
        return false;
    }

    if (info.type !== "range") {
        consoleWrap.warn("isPropertyInfoRange", {
            msg: "info.type !== range",
            info,
        });
        return false;
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
        consoleWrap.warn("isPropertyInfoNest", {
            msg: "info == undefined",
            info,
        });
        return false;
    }

    if (typeof info.type !== "string") {
        consoleWrap.warn("isPropertyInfoNest", {
            msg: "typeof info.type !== string",
            info,
        });
        return false;
    }
    if (info.type !== "nest") {
        consoleWrap.warn("isPropertyInfoNest", {
            msg: "info.type !== nest",
            info,
        });
        return false;
    }

    if (typeof info.label !== "string") {
        consoleWrap.warn("isPropertyInfoNest", {
            msg: "typeof info.label !== string",
            info,
        });
        return false;
    }

    if (!isPropertyInfoList(info.child)) {
        consoleWrap.warn("isPropertyInfoNest", {
            msg: "!isPropertyInfo(info.child)",
            info,
        });
        return false;
    }

    return true;
}
