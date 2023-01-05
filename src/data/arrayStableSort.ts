import { arraySwap } from "./arraySwap.js";

export { arrayStableSort, shakerSort, mergeSort };

function arrayStableSort<T>(ary: T[], compareIfMoveBehindFunc = function (a: T, b: T) { return a > b; }): T[] {
    return mergeSort(ary, compareIfMoveBehindFunc);
}

function shakerSort<T>(ary: T[], compareIfMoveBehindFunc = function (a: T, b: T) { return a > b; }): T[] {
    let topInx = 0;
    let btmInx = ary.length - 1;

    while (true) {
        let swapInx: number;

        swapInx = topInx;
        for (let i = topInx; i < btmInx; i++) {
            if (compareIfMoveBehindFunc(ary[i]!, ary[i + 1]!)) {
                arraySwap(ary, i, i + 1);
                swapInx = i;
            }
        }
        btmInx = swapInx;
        if (topInx === btmInx) { break; }

        swapInx = btmInx;
        for (let i = btmInx; i > topInx; i--) {
            if (compareIfMoveBehindFunc(ary[i - 1]!, ary[i]!)) {
                arraySwap(ary, i - 1, i);
                swapInx = i;
            }
        }
        topInx = swapInx;
        if (topInx === btmInx) { break; }
    }

    return ary;
}

function mergeSort<T>(ary: T[], compareIfMoveBehindFunc = function (a: T, b: T) { return a > b; }): T[] {
    const aryWork: T[] = new Array(ary.length);

    const mergeSortSub = (topInx: number, btmInx: number) => {
        if (btmInx - topInx <= 1) {
            return;
        }
        const midInx = Math.floor((topInx + btmInx) / 2);

        mergeSortSub(topInx, midInx);
        mergeSortSub(midInx, btmInx);

        merge(topInx, midInx, btmInx);
    };
    const merge = (topInx: number, midInx: number, btmInx: number) => {
        let upperSeek = topInx;
        let lowerSeek = midInx;
        let workSeek = 0;

        while (upperSeek < midInx && lowerSeek < btmInx) {
            if (!compareIfMoveBehindFunc(ary[upperSeek]!, ary[lowerSeek]!)) {
                aryWork[workSeek] = ary[upperSeek]!;
                workSeek++;
                upperSeek++;
            } else {
                aryWork[workSeek] = ary[lowerSeek]!;
                workSeek++;
                lowerSeek++;
            }
        }

        if (lowerSeek === btmInx) {
            while (upperSeek < midInx) {
                aryWork[workSeek] = ary[upperSeek]!;
                workSeek++;
                upperSeek++;
            }
        } else {
            while (lowerSeek < btmInx) {
                aryWork[workSeek] = ary[lowerSeek]!;
                workSeek++;
                lowerSeek++;
            }
        }

        for (let i = 0; i < workSeek; i++) {
            ary[topInx + i] = aryWork[i]!;
        }
    };

    mergeSortSub(0, ary.length);

    return ary;
}
