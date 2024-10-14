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

        for (const searchResult of this.searchUni(text)) {
            const searchResultID = searchResult[0];
            const searchResultMap = searchResult[1];
            if (searchResultID === "hogehoge") {
                console.log(searchResultMap);
            }

            if (!res.data.has(searchResultID)) {
                res.data.set(searchResultID, {
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
            const entry = res.data.get(searchResultID);
            if (entry == undefined) {
                throw new Error("entry == undefined");
            }

            let kind = 0;
            let count = 0;

            for (const searchResult of searchResultMap) {
                const searchTextIndex = searchResult[0];
                const targetTextIndexList = searchResult[1];

                kind++;
                count += targetTextIndexList.length;

                if (searchResultID === "hogehoge") {
                    console.log({ searchTextIndex, targetTextIndexList });
                }
                for (const targetTextIndex of targetTextIndexList) {
                    const tempUniOrderList: {
                        searchText: {
                            indexList: number[],
                            gap: number,
                        },
                        targetText: {
                            indexList: number[],
                            gap: number,
                        },
                    }[] = [];

                    for (const orderCurrent of entry.order.list) {
                        if (searchResultID === "hogehoge") {
                            console.log(targetTextIndex, orderCurrent.searchText.indexList, orderCurrent.targetText.indexList);
                        }

                        const orderCurrentSearchIndexLast = orderCurrent.searchText.indexList.at(-1);
                        const orderCurrentTargetIndexLast = orderCurrent.targetText.indexList.at(-1);
                        if (orderCurrentSearchIndexLast == undefined || orderCurrentTargetIndexLast == undefined) {
                            throw new Error("iSearchLast == undefined || iTargetLast == undefined");
                        }

                        if (orderCurrentSearchIndexLast >= searchTextIndex) {
                            continue;
                        }
                        if (orderCurrentTargetIndexLast >= targetTextIndex) {
                            continue;
                        }

                        if (searchTextIndex > orderCurrentSearchIndexLast + 3) {
                            continue;
                        }
                        const tempSearchGap = orderCurrent.searchText.gap + (searchTextIndex - orderCurrentSearchIndexLast - 1);
                        if (tempSearchGap > 6) {
                            continue;
                        }

                        if (targetTextIndex > orderCurrentTargetIndexLast + 3) {
                            continue;
                        }
                        const tempTargetGap = orderCurrent.targetText.gap + (targetTextIndex - orderCurrentTargetIndexLast - 1);
                        if (tempTargetGap > 6) {
                            continue;
                        }

                        const tempSearchIndexList: number[] = [];
                        for (const t of orderCurrent.searchText.indexList) {
                            tempSearchIndexList.push(t);
                        }
                        tempSearchIndexList.push(searchTextIndex);

                        const tempTargetIndexList: number[] = [];
                        for (const t of orderCurrent.targetText.indexList) {
                            tempTargetIndexList.push(t);
                        }
                        tempTargetIndexList.push(targetTextIndex);

                        tempUniOrderList.push({
                            searchText: {
                                indexList: tempSearchIndexList,
                                gap: tempSearchGap,
                            },
                            targetText: {
                                indexList: tempTargetIndexList,
                                gap: tempTargetGap,
                            }
                        });
                    }

                    tempUniOrderList.push({
                        searchText: {
                            indexList: [searchTextIndex],
                            gap: 0,
                        },
                        targetText: {
                            indexList: [targetTextIndex],
                            gap: 0,
                        }
                    });

                    for (const temp of tempUniOrderList) {
                        entry.order.list.push(temp);
                    }
                }

                for (const tempOrder of entry.order.list) {
                    if (tempOrder.searchText.gap !== 0 || tempOrder.targetText.gap !== 0) {
                        continue;
                    }

                    if (tempOrder.targetText.indexList.length < entry.order.maxContinuous.length) {
                        continue;
                    }
                    if (tempOrder.targetText.indexList.length > entry.order.maxContinuous.length) {
                        entry.order.maxContinuous.length = tempOrder.targetText.indexList.length;
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

                        const temp: number[] = [];
                        for (const d of dIndexList) {
                            temp.push(d);
                        }
                        entry.set(index, temp);
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
            searchText: {
                indexList: number[],
                gap: number,
            },
            targetText: {
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
