import type { ExtractOrderObjectsValueType } from "../data/OrderObjects.js";
import { OrderObjectsAutoKey } from "../data/OrderObjectsAutoKey.js";
import type { ExtractPart } from "../type/ExtractPart.js";

export { TextSearch, type tSearchResult };

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
            data: new OrderObjectsAutoKey(v => v[0]),
        };

        const len = charList.length;
        if (len <= 0) {
            return res;
        }

        for (const searchResult of this.searchUni(text)) {
            const searchResultID = searchResult[0];
            const searchResultMap = searchResult[1];
            /*if (searchResultID === "") {
                console.log(searchResultMap);
            }*/

            if (!res.data.hasKey(searchResultID)) {
                res.data.setAuto([searchResultID, {
                    uni: {
                        kind: 0,
                        count: 0,
                    },
                    order: {
                        list: [],
                        maxContinuous: {
                            textLength: -Infinity,
                            points: [],
                        },
                        maxSearchTextIndexList: {
                            textLength: -Infinity,
                            minSearchTotalGap: {
                                gap: Infinity,
                                targetTotalGap: Infinity,
                            },
                        },
                        maxDiffList: {
                            fromSearchText: [],
                        },
                    },
                }]);
            }
            const entry = res.data.getValueNotUndefined(searchResultID)[1];

            let kind = 0;
            let count = 0;

            entry.order.list.push({
                searchText: {
                    indexList: [],
                    gap: {
                        max: 0,
                        total: 0,
                    },
                },
                targetText: {
                    indexList: [],
                    gap: {
                        max: 0,
                        total: 0,
                    },
                },
            });

            for (const searchResult of searchResultMap) {
                const searchTextIndex = searchResult[0];
                const targetTextIndexList = searchResult[1];

                kind++;
                count += targetTextIndexList.length;

                /*if (searchResultID === "") {
                    console.log({ searchTextIndex, targetTextIndexList });
                }*/

                const tempUniOrderList: ExtractPart<ExtractPart<ExtractOrderObjectsValueType<ExtractPart<tSearchResult<unknown>, "data">>[1], "order">, "list"> = [];

                let matchTargetTextIndexList = new Set<number>();

                for (const orderCurrent of entry.order.list) {
                    let flgNearestTargetTextIndex = true;
                    let flgNotMatchOrderCurrent = true;

                    /*if (searchResultID === "") {
                        console.log("orderCurrent", orderCurrent.searchText.indexList, orderCurrent.targetText.indexList);
                    }*/

                    for (const targetTextIndex of targetTextIndexList) {
                        /*if (searchResultID === "") {
                            console.log("targetText", targetTextIndex);
                        }*/

                        const orderCurrentSearchIndexLast = orderCurrent.searchText.indexList.at(-1) ?? -Infinity;
                        const orderCurrentTargetIndexLast = orderCurrent.targetText.indexList.at(-1) ?? -Infinity;

                        if (orderCurrentSearchIndexLast >= searchTextIndex) {
                            continue;
                        }
                        if (orderCurrentTargetIndexLast >= targetTextIndex) {
                            continue;
                        }

                        if (flgNearestTargetTextIndex) {
                            const tempSearchGapNow = Number.isFinite(orderCurrentSearchIndexLast) ? (searchTextIndex - orderCurrentSearchIndexLast - 1) : 0;
                            const tempTargetGapNow = Number.isFinite(orderCurrentTargetIndexLast) ? (targetTextIndex - orderCurrentTargetIndexLast - 1) : 0;

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
                                    gap: {
                                        total: orderCurrent.searchText.gap.total + tempSearchGapNow,
                                        max: Math.max(orderCurrent.searchText.gap.total, tempSearchGapNow),
                                    },
                                },
                                targetText: {
                                    indexList: tempTargetIndexList,
                                    gap: {
                                        total: orderCurrent.targetText.gap.total + tempTargetGapNow,
                                        max: Math.max(orderCurrent.targetText.gap.max, tempTargetGapNow),
                                    },
                                }
                            });

                            flgNearestTargetTextIndex = false;
                            flgNotMatchOrderCurrent = false;
                            matchTargetTextIndexList.add(targetTextIndex);
                        }
                    }

                    if (flgNotMatchOrderCurrent) {
                        tempUniOrderList.push(orderCurrent);
                    }
                }

                for (const targetTextIndex of targetTextIndexList) {
                    if (!matchTargetTextIndexList.has(targetTextIndex)) {
                        /*if (searchResultID === "") {
                            console.log("notMatchTargetTextIndexList", targetTextIndex);
                        }*/

                        tempUniOrderList.push({
                            searchText: {
                                indexList: [searchTextIndex],
                                gap: {
                                    max: 0,
                                    total: 0,
                                },
                            },
                            targetText: {
                                indexList: [targetTextIndex],
                                gap: {
                                    max: 0,
                                    total: 0,
                                },
                            }
                        });
                        matchTargetTextIndexList.add(targetTextIndex);
                    }
                }

                entry.order.list.length = 0;
                for (const temp of tempUniOrderList) {
                    /*if (searchResultID === "") {
                        console.log("tempUniOrderList", temp.searchText.indexList, temp.targetText.indexList);
                    }*/
                    entry.order.list.push(temp);
                }
            }

            entry.uni.kind += kind;
            entry.uni.count += count;

            {
                const maxContinuous: ExtractPart<ExtractPart<ExtractOrderObjectsValueType<ExtractPart<tSearchResult<unknown>, "data">>[1], "order">, "maxContinuous"> = {
                    textLength: -Infinity,
                    points: [],
                };
                for (const tempOrder of entry.order.list) {
                    let tempMaxContinuousLength = 0;
                    let tempFirst = -Infinity;
                    let tempBefore = -Infinity;

                    for (const targetTextIndex of tempOrder.targetText.indexList) {
                        if (targetTextIndex !== tempBefore + 1) {
                            if (tempMaxContinuousLength === maxContinuous.textLength) {
                                maxContinuous.points.push({
                                    start: tempFirst,
                                    end: tempBefore,
                                });
                            } else if (tempMaxContinuousLength > maxContinuous.textLength) {
                                maxContinuous.textLength = tempMaxContinuousLength;
                                maxContinuous.points = [{
                                    start: tempFirst,
                                    end: tempBefore,
                                }];
                            }

                            tempMaxContinuousLength = 0;
                            tempFirst = targetTextIndex;
                        }
                        tempMaxContinuousLength++;
                        tempBefore = targetTextIndex;
                    }

                    if (tempMaxContinuousLength === maxContinuous.textLength) {
                        maxContinuous.points.push({
                            start: tempFirst,
                            end: tempBefore,
                        });
                    } else if (tempMaxContinuousLength > maxContinuous.textLength) {
                        maxContinuous.textLength = tempMaxContinuousLength;
                        maxContinuous.points = [{
                            start: tempFirst,
                            end: tempBefore,
                        }];
                    }
                }
                if (maxContinuous.textLength === entry.order.maxContinuous.textLength) {
                    entry.order.maxContinuous.points.push(...maxContinuous.points);
                } else if (maxContinuous.textLength > entry.order.maxContinuous.textLength) {
                    entry.order.maxContinuous = maxContinuous;
                }
            }
            {
                for (const tempOrder of entry.order.list) {
                    if (tempOrder.searchText.indexList.length === entry.order.maxSearchTextIndexList.textLength) {
                        if (tempOrder.searchText.gap.total < entry.order.maxSearchTextIndexList.minSearchTotalGap.gap) {
                            entry.order.maxSearchTextIndexList.minSearchTotalGap = {
                                gap: tempOrder.searchText.gap.total,
                                targetTotalGap: tempOrder.targetText.gap.total,
                            };
                        }
                    } else if (tempOrder.searchText.indexList.length > entry.order.maxSearchTextIndexList.textLength) {
                        entry.order.maxSearchTextIndexList = {
                            textLength: tempOrder.searchText.indexList.length,
                            minSearchTotalGap: {
                                gap: tempOrder.searchText.gap.total,
                                targetTotalGap: tempOrder.targetText.gap.total,
                            }
                        };
                    }
                }
            }
            {
                const maxRange = 3;

                const searchTextIndexList: OrderObjectsAutoKey<number, [number, Set<number>]> = new OrderObjectsAutoKey(v => v[0]);
                for (const tempOrder of entry.order.list) {
                    for (let i = 0; i < tempOrder.searchText.indexList.length; i++) {
                        const searchTextIndex = tempOrder.searchText.indexList[i];
                        if (searchTextIndex == undefined) { throw new Error(""); }

                        const targetTextIndex = tempOrder.targetText.indexList[i];
                        if (targetTextIndex == undefined) { throw new Error(""); }


                        searchTextIndexList.getValueWithPushAutoDefault(searchTextIndex, newKeySet<number, number>)[1].add(targetTextIndex);
                    }
                }
                searchTextIndexList.sort((a, b) => a[0] > b[0]);

                let minJunk = Infinity;
                while (true) {
                    const fitst = searchTextIndexList.shift();
                    if (fitst == undefined) {
                        break;
                    }

                    for (const f of fitst[1]) {
                        let extra = 0;
                        let insufficient = res.searchText.length - (searchTextIndexList.last?.[0] ?? -Infinity) - 1;
                        insufficient += fitst[0];

                        let beforeSearchIndex = fitst[0];
                        let beforeTargetIndex = f;

                        for (const searchTextIndex of searchTextIndexList) {
                            if (searchTextIndex[0] > beforeSearchIndex + 1) {
                                insufficient += searchTextIndex[0] - (beforeSearchIndex + 1)
                            }
                            beforeSearchIndex = searchTextIndex[0];

                            {
                                const tempIndexList = [...searchTextIndex[1]];
                                tempIndexList.sort((a, b) => a - b);

                                let foundFlg = false;
                                for (const targetIndex of tempIndexList) {
                                    if (beforeTargetIndex < targetIndex) {
                                        if (targetIndex - beforeTargetIndex > maxRange) {
                                            break;
                                        }

                                        extra += targetIndex - beforeTargetIndex - 1;
                                        beforeTargetIndex = targetIndex;
                                        foundFlg = true;
                                        break;
                                    }
                                }
                                if (!foundFlg) {
                                    insufficient++;
                                }
                            }
                        }

                        if (extra + insufficient === minJunk) {
                            entry.order.maxDiffList.fromSearchText.push({ extra, insufficient, });
                        } else if (extra + insufficient < minJunk) {
                            entry.order.maxDiffList.fromSearchText.length = 0;
                            entry.order.maxDiffList.fromSearchText.push({ extra, insufficient, });
                            minJunk = extra + insufficient;
                        }
                    }
                }
            }
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
    data: OrderObjectsAutoKey<ID, [ID, {
        uni: {
            kind: number,
            count: number,
        },
        order: {
            list: {
                searchText: {
                    indexList: number[],
                    gap: {
                        max: number,
                        total: number,
                    },
                },
                targetText: {
                    indexList: number[],
                    gap: {
                        max: number,
                        total: number,
                    },
                },
            }[],
            maxContinuous: {
                textLength: number,
                points: {
                    start: number,
                    end: number,
                }[],
            },
            maxSearchTextIndexList: {
                textLength: number,
                minSearchTotalGap: {
                    gap: number,
                    targetTotalGap: number,
                },
            },
            maxDiffList: {
                fromSearchText: {
                    extra: number,
                    insufficient: number,
                }[],
            },
        },
    }]>,
};

function newKeySet<K, V>(k: K): [K, Set<V>] {
    return [k, new Set<V>()];
}
