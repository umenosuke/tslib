import type { tJson } from "./typeJson.js";

export { cloneProperty };

function cloneProperty<T extends tJson>(source: T): T {
    return JSON.parse(JSON.stringify(source));
}
