import { ConsoleWrap } from "../console/ConsoleWrap.js";
import { generateHtmlElements } from "./generateHtmlElements.js";
import type { OptionBase } from "./OptionBase.js";
import type { PropertyHtml, PropertyInfo } from "./type.js";

export { generateDocumentFragment };
const consoleWrap = new ConsoleWrap();
export const generateDocumentFragmentConsoleOption = consoleWrap.enables;

function generateDocumentFragment<DATA_PROPERTY_INFO extends PropertyInfo>(opt: OptionBase<DATA_PROPERTY_INFO>): DocumentFragment {
    return _generateDocumentFragment(generateHtmlElements(opt));
}

function _generateDocumentFragment<DATA_PROPERTY_INFO extends PropertyInfo>(elems: PropertyHtml<DATA_PROPERTY_INFO>): DocumentFragment {
    const frag = document.createDocumentFragment();

    for (const key in elems) {
        const elem = elems[key];

        switch (elem.type) {
            case "boolean": {
                const label = document.createElement("label");
                frag.appendChild(label);
                {
                    label.appendChild(elem.valueElem);
                    label.appendChild(elem.labelElem);
                }

                frag.appendChild(document.createElement("br"));
                break;
            }

            case "string":
            case "number":
            case "range":
            case "enum": {
                const label = document.createElement("label");
                frag.appendChild(label);
                {
                    label.appendChild(elem.labelElem);
                    label.appendChild(elem.valueElem);
                }

                frag.appendChild(document.createElement("br"));
                break;
            }

            case "nest": {
                const div = document.createElement("div");
                frag.appendChild(div);
                {
                    {
                        div.appendChild(elem.labelElem);
                        div.appendChild(document.createElement("br"));
                        {
                            const child = (elem as any)["child"];
                            if (child == undefined) {
                                throw new Error("child == undefined");
                            }
                            div.appendChild(_generateDocumentFragment(child));
                        }
                    }
                }
                break;
            }

            default: {
                consoleWrap.error("unknown elem.type", elem);
                throw new Error("unknown elem.type");
            }
        }
    }

    return frag;
}
