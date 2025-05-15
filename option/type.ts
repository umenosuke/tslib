export { type PropertyInfo, type PropertyData, type PropertyDataEnum, type PropertyHtml, type PropertyInfoPrimitiveMap, type PropertyInfoEnum };

type PropertyInfo = Record<string,
    {
        "type": keyof PropertyInfoPrimitiveMap,
        "label": string,
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
};
type PropertyInfoEnum = {
    "type": "enum",
    "label": string,
    "list": readonly {
        "label": string,
        "value": string,
    }[],
};

type PropertyData<PROPERTY_INFO extends PropertyInfo> = {
    [K in keyof PROPERTY_INFO]: PROPERTY_INFO[K]["type"] extends keyof PropertyInfoPrimitiveMap
    ? PropertyInfoPrimitiveMap[PROPERTY_INFO[K]["type"]]
    : (PROPERTY_INFO[K]["type"] extends "enum"
        ? (PROPERTY_INFO[K] extends { "list": infer PROPERTY_INFO_ENUM_LIST }
            ? (PROPERTY_INFO_ENUM_LIST extends readonly { "value": string, }[]
                ? PropertyDataEnum<PROPERTY_INFO_ENUM_LIST>
                : never
            )
            : never
        )
        : (PROPERTY_INFO[K]["type"] extends "nest"
            ? (PROPERTY_INFO[K] extends { "child": infer CHILD }
                ? (CHILD extends PropertyInfo
                    ? PropertyData<CHILD>
                    : never
                )
                : never
            )
            : never
        )
    )
};
type PropertyDataEnum<LIST extends readonly { "value": string, }[]> = (
    LIST extends readonly { "value": infer PROPERTY_INFO_ENUM_LIST_VALUE, }[]
    ? (
        string extends PROPERTY_INFO_ENUM_LIST_VALUE
        ? never
        : PROPERTY_INFO_ENUM_LIST_VALUE
    )
    : never
);

type PropertyHtml<PROPERTY_INFO extends PropertyInfo> = {
    [K in keyof PROPERTY_INFO]: PROPERTY_INFO[K]["type"] extends keyof PropertyInfoPrimitiveMap
    ? ({
        type: PROPERTY_INFO[K]["type"],
        label: HTMLSpanElement,
        elem: HTMLInputElement,
    })
    : (PROPERTY_INFO[K]["type"] extends "enum"
        ? ({
            type: PROPERTY_INFO[K]["type"],
            label: HTMLSpanElement,
            elem: HTMLSelectElement,
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
