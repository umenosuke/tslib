export { search, searchAll }

function search<T extends HTMLElement>(query: string, elem: Document | Element = document): T {
    const e = elem.querySelector<T>(query);
    if (e == null) { throw new Error("not found : \"" + query + "\""); }
    return e;
};

function searchAll<T extends HTMLElement>(query: string, elem: Document | Element = document): NodeListOf<T> {
    const e = elem.querySelectorAll<T>(query);
    if (e.length === 0) { throw new Error("not found : \"" + query + "\""); }
    return e;
};
