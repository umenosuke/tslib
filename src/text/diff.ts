export { Diff, Option, tDiffResult, tDiffResultState };

type tDiffResult = {
    state: tDiffResultState.same,
    oldLineNum: number,
    oldLine: string,
    newLineNum: number,
    newLine: string
} | {
    state: tDiffResultState.add,
    newLineNum: number,
    newLine: string
} | {
    state: tDiffResultState.del,
    oldLineNum: number,
    oldLine: string
} | {
    state: tDiffResultState.skip,
    oldLineNum: number | undefined,
    oldLine: string | undefined,
    newLineNum: number | undefined,
    newLine: string | undefined
};
enum tDiffResultState {
    same = "same",
    add = "added",
    del = "deleted",
    skip = "skip"
};

class Diff {
    private opt: Option;

    constructor(opt = new Option()) {
        if (opt == undefined) {
            console.warn("opt is undefined");
            this.opt = new Option();
        } else {
            this.opt = opt;
        }
    }

    public setOption(opt: Option) {
        if (opt == undefined) {
            console.warn("opt is undefined");
            return;
        }

        this.opt = opt;
    }

    public diff(oldText: string, newText: string): tDiffResult[] {
        const oldLinesOrig = oldText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        const newLinesOrig = newText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        const oldLines = (() => {
            if (this.opt.ignoreSpace) {
                return oldLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ''));
            } else if (this.opt.lineTrim && this.opt.ignoreContiguousSpace) {
                return oldLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ' ').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''));
            } else if (this.opt.ignoreContiguousSpace) {
                return oldLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ' '));
            } else if (this.opt.lineTrim) {
                return oldLinesOrig.map(line => line.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''));
            } else {
                return oldLinesOrig;
            }
        })();
        const newLines = (() => {
            if (this.opt.ignoreSpace) {
                return newLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ''));
            } else if (this.opt.lineTrim && this.opt.ignoreContiguousSpace) {
                return newLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ' ').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''));
            } else if (this.opt.ignoreContiguousSpace) {
                return newLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ' '));
            } else if (this.opt.lineTrim) {
                return newLinesOrig.map(line => line.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''));
            } else {
                return newLinesOrig;
            }
        })();

        const oldLen = oldLinesOrig.length;
        const newLen = newLinesOrig.length;

        let oldSeek = 0;
        let newSeek = 0;

        let diffRes: tDiffResult[] = [];

        while (oldSeek < oldLen && newSeek < newLen) {
            if (this.opt.ignoreBlankLine && (oldLines[oldSeek] === "" || newLines[newSeek] === "")) {
                const tmpRes: tDiffResult = {
                    state: tDiffResultState.skip,
                    oldLineNum: undefined,
                    oldLine: undefined,
                    newLineNum: undefined,
                    newLine: undefined
                };

                if (oldLines[oldSeek] === "") {
                    tmpRes.oldLineNum = oldSeek;
                    tmpRes.oldLine = oldLinesOrig[oldSeek];
                    oldSeek++;
                }
                if (newLines[newSeek] === "") {
                    tmpRes.newLineNum = newSeek;
                    tmpRes.newLine = newLinesOrig[newSeek];
                    newSeek++;
                }
                diffRes.push(tmpRes);
            } else if (oldLines[oldSeek] === newLines[newSeek]) {
                diffRes.push({
                    state: tDiffResultState.same,
                    oldLineNum: oldSeek,
                    oldLine: oldLinesOrig[oldSeek]!,
                    newLineNum: newSeek,
                    newLine: newLinesOrig[newSeek]!
                });
                oldSeek++;
                newSeek++;
            } else {
                const tmpDiffStr: tDiffResult[] = [];
                let tmpSeek = 0;
                let skip = 0;
                while (newSeek + tmpSeek < newLen) {
                    if (tmpSeek - skip > this.opt.searchLineRange) {
                        break;
                    }

                    if (this.opt.ignoreBlankLine && (newLines[newSeek + tmpSeek] === "")) {
                        tmpDiffStr.push({
                            state: tDiffResultState.skip,
                            oldLineNum: undefined,
                            oldLine: undefined,
                            newLineNum: newSeek + tmpSeek,
                            newLine: newLinesOrig[newSeek + tmpSeek]
                        });
                        tmpSeek++;
                        skip++;
                    } else if (oldLines[oldSeek] === newLines[newSeek + tmpSeek]) {
                        tmpDiffStr.push({
                            state: tDiffResultState.same,
                            oldLineNum: oldSeek,
                            oldLine: oldLinesOrig[oldSeek]!,
                            newLineNum: newSeek + tmpSeek,
                            newLine: newLinesOrig[newSeek + tmpSeek]!
                        });
                        break;
                    } else {
                        tmpDiffStr.push({
                            state: tDiffResultState.add,
                            newLineNum: newSeek + tmpSeek,
                            newLine: newLinesOrig[newSeek + tmpSeek]!
                        });
                        tmpSeek++;
                    }
                }

                if (newSeek + tmpSeek === newLen || tmpSeek - skip > this.opt.searchLineRange) {
                    diffRes.push({
                        state: tDiffResultState.del,
                        oldLineNum: oldSeek,
                        oldLine: oldLinesOrig[oldSeek]!
                    });
                    oldSeek++;
                } else {
                    diffRes = diffRes.concat(tmpDiffStr);
                    oldSeek++;
                    newSeek += tmpSeek + 1;
                }
            }
        }

        while (newSeek < newLen) {
            if (newLines[newSeek] === "") {
                diffRes.push({
                    state: tDiffResultState.skip,
                    oldLineNum: undefined,
                    oldLine: undefined,
                    newLineNum: newSeek,
                    newLine: newLinesOrig[newSeek]
                });
            } else {
                diffRes.push({
                    state: tDiffResultState.add,
                    newLineNum: newSeek,
                    newLine: newLinesOrig[newSeek]!
                });
            }
            newSeek++;
        }

        while (oldSeek < oldLen) {
            if (oldLines[oldSeek] === "") {
                diffRes.push({
                    state: tDiffResultState.skip,
                    oldLineNum: oldSeek,
                    oldLine: oldLinesOrig[oldSeek],
                    newLineNum: undefined,
                    newLine: undefined
                });
            } else {
                diffRes.push({
                    state: tDiffResultState.del,
                    oldLineNum: oldSeek,
                    oldLine: oldLinesOrig[oldSeek]!
                });
            }
            oldSeek++;
        }

        return diffRes;
    }
}

class Option {
    private _lineTrim: boolean;
    public get lineTrim(): boolean {
        return this._lineTrim;
    }
    public set lineTrim(input: boolean) {
        this._lineTrim = !!input;
    }

    private _ignoreContiguousSpace: boolean;
    public get ignoreContiguousSpace(): boolean {
        return this._ignoreContiguousSpace;
    }
    public set ignoreContiguousSpace(input: boolean) {
        this._ignoreContiguousSpace = !!input;
    }

    private _ignoreSpace: boolean;
    public get ignoreSpace(): boolean {
        return this._ignoreSpace;
    }
    public set ignoreSpace(input: boolean) {
        this._ignoreSpace = !!input;
    }

    private _ignoreBlankLine: boolean;
    public get ignoreBlankLine(): boolean {
        return this._ignoreBlankLine;
    }
    public set ignoreBlankLine(input: boolean) {
        this._ignoreBlankLine = !!input;
    }

    private _searchLineRange: number;
    public get searchLineRange(): number {
        return this._searchLineRange;
    }
    public set searchLineRange(input: number) {
        if (Number.isNaN(input)) {
            console.warn("input is NaN : ", input);
            return;
        }

        if (input < 0) {
            this._searchLineRange = Infinity;
        } else {
            this._searchLineRange = input;
        }
    }

    constructor() {
        this._lineTrim = false;
        this._ignoreContiguousSpace = false;
        this._ignoreSpace = false;
        this._ignoreBlankLine = false;
        this._searchLineRange = Infinity;
    }
};
