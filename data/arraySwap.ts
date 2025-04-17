export { arraySwap };

function arraySwap<T>(ary: T[], inx1: number, inx2: number): T[] {
    if (inx1 < 0 || inx2 < 0) {
        throw new Error("inx1 < 0 || inx2 < 0");
    }

    if (ary.length > inx1 && ary.length > inx2) {
        const tmp = ary[inx1];
        ary[inx1] = ary[inx2]!;
        ary[inx2] = tmp!;
    }

    return ary;
}
