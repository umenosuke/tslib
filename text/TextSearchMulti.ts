import { OrderObjects } from "../data/OrderObjects.js";
import { OrderObjectsAutoKey } from "../data/OrderObjectsAutoKey.js";
import { TextSearch, type tSearchResult } from "./TextSearch.js";

export { TextSearchMulti, type tSearchResultMulti };

class TextSearchMulti<TAG, ID> {
    private textSearchList: Map<TAG, TextSearch<ID>>
    private maxRuneSize: number;

    constructor(maxRuneSize: number = 1) {
        this.textSearchList = new Map();
        this.maxRuneSize = maxRuneSize;
    }

    public add(tag: TAG, id: ID, text: string) {
        if (!this.textSearchList.has(tag)) {
            this.textSearchList.set(tag, new TextSearch(this.maxRuneSize));
        }

        const textSearch = this.textSearchList.get(tag);
        if (textSearch == undefined) {
            throw new Error("textSearch == undefined");
        }

        textSearch.add(id, text);
    }

    public search(text: string): tSearchResultMulti<TAG, ID> {
        const res: tSearchResultMulti<TAG, ID> = new OrderObjectsAutoKey(v => v[0]);

        for (const textSearch of this.textSearchList) {
            res.setAuto([textSearch[0], textSearch[1].search(text)]);
        }

        return res;
    }
}

type tSearchResultMulti<TAG, ID> = OrderObjectsAutoKey<TAG, [TAG, tSearchResult<ID>]>;

