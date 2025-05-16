export { ConsoleWrap };

class ConsoleWrap {
    public readonly enables: {
        debug: boolean,
        warn: boolean,
        error: boolean,
    };

    constructor({
        debug = false,
        warn = false,
        error = true,
    }: {
        debug?: boolean,
        warn?: boolean,
        error?: boolean,
    } = {}) {
        this.enables = {
            debug: debug,
            warn: warn,
            error: error,
        };
    }

    public get log(): (...data: any[]) => void {
        if (this.enables.debug) {
            return console.log;
        } else {
            return dummyConsole;
        }
    }
    public get warn(): (...data: any[]) => void {
        if (this.enables.warn) {
            return console.warn;
        } else {
            return dummyConsole;
        }
    }
    public get error(): (...data: any[]) => void {
        if (this.enables.error) {
            return console.error;
        } else {
            return dummyConsole;
        }
    }
}

function dummyConsole() { }
