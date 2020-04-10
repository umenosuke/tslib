export { Diff, Option };

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

    public diff(oldText: string, newText: string): string[] {
        const oldLinesOrig = oldText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        const newLinesOrig = newText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
        const oldLines = this.opt.ignoreSpace
            ? oldLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ''))
            : (this.opt.lineTrim
                ? oldLinesOrig.map(line => line.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''))
                : oldLinesOrig);
        const newLines = this.opt.ignoreSpace
            ? newLinesOrig.map(line => line.replace(/[\s\uFEFF\xA0]+/g, ''))
            : (this.opt.lineTrim
                ? newLinesOrig.map(line => line.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''))
                : newLinesOrig);

        const oldLen = oldLinesOrig.length;
        const newLen = newLinesOrig.length;

        let oldSeek = 0;
        let newSeek = 0;

        let diffStr: string[] = [];

        while (oldSeek < oldLen && newSeek < newLen) {
            if (this.opt.ignoreBlankLine && (oldLines[oldSeek] === "" || newLines[newSeek] === "")) {
                if (oldLines[oldSeek] === "") {
                    oldSeek++;
                }
                if (newLines[newSeek] === "") {
                    newSeek++;
                }
            } else if (oldLines[oldSeek] === newLines[newSeek]) {
                diffStr.push("  " + oldLinesOrig[oldSeek]);
                oldSeek++;
                newSeek++;
            } else {
                const tmpDiffStr: string[] = [];
                let tmpSeek = 0;
                let skip = 0;
                while (newSeek + tmpSeek < newLen) {
                    if (tmpSeek - skip > this.opt.searchLineRange) {
                        break;
                    }

                    if (this.opt.ignoreBlankLine && (newLines[newSeek + tmpSeek] === "")) {
                        tmpSeek++;
                        skip++;
                    } else if (oldLines[oldSeek] === newLines[newSeek + tmpSeek]) {
                        tmpDiffStr.push("  " + oldLinesOrig[oldSeek]);
                        break;
                    } else {
                        tmpDiffStr.push("> " + newLinesOrig[newSeek + tmpSeek]);
                        tmpSeek++;
                    }
                }

                if (newSeek + tmpSeek === newLen || tmpSeek - skip > this.opt.searchLineRange) {
                    diffStr.push("< " + oldLinesOrig[oldSeek]);
                    oldSeek++;
                } else {
                    diffStr = diffStr.concat(tmpDiffStr);
                    oldSeek++;
                    newSeek += tmpSeek + 1;
                }
            }
        }

        while (newSeek < newLen) {
            diffStr.push("> " + newLinesOrig[newSeek]);
            newSeek++;
        }

        while (oldSeek < oldLen) {
            diffStr.push("< " + oldLinesOrig[oldSeek]);
            oldSeek++;
        }

        return diffStr;
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
        this._ignoreSpace = false;
        this._ignoreBlankLine = false;
        this._searchLineRange = Infinity;
    }
};
