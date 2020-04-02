import { arraySwap } from "./arraySwap";

export { arrayStableSort };

function arrayStableSort<T>(ary: T[], compareFunction = function (a: T, b: T) { return a > b; }): T[] {
    let topInx = 0;
    let btmInx = ary.length - 1;

    while (true) {
        let swapInx: number;

        swapInx = topInx;
        for (let i = topInx; i < btmInx; i++) {
            if (compareFunction(ary[i], ary[i + 1])) {
                ary = arraySwap(ary, i, i + 1);
                swapInx = i;
            }
        }
        btmInx = swapInx;
        if (topInx === btmInx) { break; }

        swapInx = btmInx;
        for (let i = btmInx; i > topInx; i--) {
            if (compareFunction(ary[i - 1], ary[i])) {
                ary = arraySwap(ary, i - 1, i);
                swapInx = i;
            }
        }
        topInx = swapInx;
        if (topInx === btmInx) { break; }
    }

    return ary;
}
