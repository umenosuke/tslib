export { type PropertyInfo, type PropertyInfoPrimitiveMap, type PropertyInfoEnum, type PropertyData, type PropertyDataEnum, type PropertyHtml };

type PropertyInfo = Record<string,
    {
        "type": "boolean",
        "label": string,
    }
    | {
        "type": "string",
        "label": string,
    }
    | {
        "type": "number",
        "label": string,
        "min"?: number,
        "max"?: number,
        "step"?: number,
    }
    | {
        "type": "range",
        "label": string,
        "min"?: number,
        "max"?: number,
        "step"?: number,
    }
    | PropertyInfoEnum
    | {
        "type": "nest",
        "label": string,
        "child": PropertyInfo,
    }
>;
type PropertyInfoPrimitiveMap = {
    "boolean": boolean,
    "string": string,
    "number": number,
    "range": number,
};
type PropertyInfoEnum = {
    "type": "enum",
    "label": string,
    "list": readonly {
        "label": string,
        "value": string,
    }[],
};

type PropertyData<PROPERTY_INFO extends PropertyInfo> = PropertyDataPropertyRoRw<{
    [K in keyof PROPERTY_INFO]: PROPERTY_INFO[K]["type"] extends keyof PropertyInfoPrimitiveMap
    ? ({
        readonly: false,
        value: PropertyInfoPrimitiveMap[PROPERTY_INFO[K]["type"]],
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
}>;
type PropertyDataEnum<LIST extends readonly { "value": string, }[]> = (
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

type PropertyHtml<PROPERTY_INFO extends PropertyInfo> = {
    [K in keyof PROPERTY_INFO]: PROPERTY_INFO[K]["type"] extends keyof PropertyInfoPrimitiveMap
    ? ({
        type: PROPERTY_INFO[K]["type"],
        label: HTMLSpanElement,
        value: HTMLInputElement,
    })
    : (PROPERTY_INFO[K]["type"] extends "enum"
        ? ({
            type: PROPERTY_INFO[K]["type"],
            label: HTMLSpanElement,
            value: HTMLSelectElement,
        })
        : (PROPERTY_INFO[K]["type"] extends "nest"
            ? (PROPERTY_INFO[K] extends { "child": infer CHILD }
                ? (CHILD extends PropertyInfo
                    ? ({
                        type: PROPERTY_INFO[K]["type"],
                        label: HTMLSpanElement,
                        child: PropertyHtml<CHILD>,
                    })
                    : never
                )
                : never
            )
            : never
        )
    )
};
