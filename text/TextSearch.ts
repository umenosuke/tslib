export { TextSearch, type tSearchResult, type tSearchResultData };

class TextSearch<ID> {
    private uniGram: Map<string, Map<ID, number[]>>;

    constructor() {
        this.uniGram = new Map();
    }

    public add(id: ID, text: string) {
        const charList = getCharList(text);

        const len = charList.length;
        if (len <= 0) {
            return;
        }

        let index = 0;
        while (true) {
            const char1 = charList[index];
            if (char1 == undefined) {
                throw new Error("char1 == undefined");
            }

            {
                const char = char1;
                if (!this.uniGram.has(char)) {
                    this.uniGram.set(char, new Map());
                }
                const list = this.uniGram.get(char);
                if (list == undefined) {
                    throw new Error("list == undefined");
                }

                if (!list.has(id)) {
                    list.set(id, []);
                }

                const indexList = list.get(id);
                if (indexList == undefined) {
                    throw new Error("indexList == undefined");
                }
                indexList.push(index);
            }

            if (index + 1 >= len) {
                break;
            }

            index++;
        }
    }

    public search(text: string): tSearchResult<ID> {
        const charList = getCharList(text);
        const res: tSearchResult<ID> = {
            searchText: charList,
            data: new Map(),
        };

        const len = charList.length;
        if (len <= 0) {
            return res;
        }

        for (const e of this.searchUni(text)) {
            const eID = e[0];
            const eInxListMap = e[1];

            if (!res.data.has(eID)) {
                res.data.set(eID, {
                    uni: {
                        kind: 0,
                        count: 0,
                    },
                    order: {
                        list: [],
                        maxContinuous: {
                            count: 0,
                            length: 0,
                        },
                    },
                });
            }
            const entry = res.data.get(eID);
            if (entry == undefined) {
                throw new Error("entry == undefined");
            }

            let kind = 0;
            let count = 0;

            for (const eInxList of eInxListMap) {
                kind++;
                count += eInxList[1].length;

                const tempUniOrderList: {
                    search: {
                        indexList: number[],
                        gap: number,
                    },
                    target: {
                        indexList: number[],
                        gap: number,
                    },
                }[] = [];
                for (const eInx of eInxList[1]) {
                    for (const iList of entry.order.list) {
                        const iSearchLast = iList.search.indexList.at(-1) ?? Infinity;
                        const iTargetLast = iList.target.indexList.at(-1) ?? Infinity;
                        if (iTargetLast < eInx) {
                            tempUniOrderList.push({
                                search: {
                                    indexList: [...iList.search.indexList, eInxList[0]],
                                    gap: iList.search.gap + (eInxList[0] - iSearchLast - 1),
                                },
                                target: {
                                    indexList: [...iList.target.indexList, eInx],
                                    gap: iList.target.gap + (eInx - iTargetLast - 1),
                                }
                            });
                        }
                    }
                    tempUniOrderList.push({
                        search: {
                            indexList: [eInxList[0]],
                            gap: 0,
                        },
                        target: {
                            indexList: [eInx],
                            gap: 0,
                        }
                    });
                }
                entry.order.list.push(...tempUniOrderList);

                for (const tempUniOrder of tempUniOrderList) {
                    if (tempUniOrder.search.gap !== 0 || tempUniOrder.target.gap !== 0) {
                        continue;
                    }

                    if (tempUniOrder.target.indexList.length < entry.order.maxContinuous.length) {
                        continue;
                    }
                    if (tempUniOrder.target.indexList.length > entry.order.maxContinuous.length) {
                        entry.order.maxContinuous.length = tempUniOrder.target.indexList.length;
                        entry.order.maxContinuous.count = 0;
                    }
                    entry.order.maxContinuous.count++;
                }
            }

            entry.uni.kind += kind;
            entry.uni.count += count;
        }

        return res;
    }

    public searchUni(text: string): Map<ID, Map<number, number[]>> {
        const charList = getCharList(text);
        const res: Map<ID, Map<number, number[]>> = new Map();

        const len = charList.length;
        for (let index = 0; index < len; index++) {
            const char1 = charList[index];
            if (char1 == undefined) {
                throw new Error("char1 == undefined");
            }

            {
                const list = this.uniGram.get(char1);
                if (list != undefined) {
                    for (const d of list) {
                        const eID = d[0];
                        const dIndexList = d[1];

                        if (!res.has(eID)) {
                            res.set(eID, new Map());
                        }
                        const entry = res.get(eID);
                        if (entry == undefined) {
                            throw new Error("entry == undefined");
                        }

                        entry.set(index, [...dIndexList]);
                    }
                }
            }
        }

        return res;
    }
}

function getCharList(text: string): string[] {
    return [...(text.normalize("NFKC").toLowerCase())];
}

type tSearchResult<ID> = {
    searchText: string[],
    data: Map<ID, tSearchResultData>,
};
type tSearchResultData = {
    uni: {
        kind: number,
        count: number,
    },
    order: {
        list: {
            search: {
                indexList: number[],
                gap: number,
            },
            target: {
                indexList: number[],
                gap: number,
            },
        }[],
        maxContinuous: {
            length: number,
            count: number,
        }
    },
};
