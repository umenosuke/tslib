import { ConsoleWrap } from "../console/ConsoleWrap.js";
import { keyGenerateFromID, OrderObjectsAutoKey } from "../data/OrderObjectsAutoKey.js";
import { sleep } from "../time/sleep.js";

export { JobQueue, ErrJobAbort };

const consoleWrap = new ConsoleWrap();
export const JobQueueConsoleOption = consoleWrap.enables;

class JobQueue<ARGUMENT, RETURN_VALUE> {
    private jobFunc: (argument: ARGUMENT, signal: tJobSignal) => Promise<RETURN_VALUE>;
    private jobWaitingQueue: OrderObjectsAutoKey<string, JobWait<ARGUMENT, RETURN_VALUE>>;
    private jobRunningQueue: OrderObjectsAutoKey<string, JobRunning>;

    private opt: {
        parallels: number,
        execInterval: number,
    };

    private runningWorkerCount: number;

    get queueLength(): number {
        return this.jobWaitingQueue.length + this.jobRunningQueue.length;
    }
    get jobIdList(): string[] {
        return (<string[]>[]).concat(this.jobWaitingQueue.getKeys(), this.jobRunningQueue.getKeys());
    }

    constructor(jobFunc: (argument: ARGUMENT, signal: tJobSignal) => Promise<RETURN_VALUE>, {
        parallels = 1,
        execInterval = 0,
    }: {
        parallels?: number,
        execInterval?: number,
    } = {}) {
        this.jobFunc = jobFunc;
        this.jobWaitingQueue = new OrderObjectsAutoKey(keyGenerateFromID);
        this.jobRunningQueue = new OrderObjectsAutoKey(keyGenerateFromID);

        this.opt = {
            parallels: parallels,
            execInterval: execInterval,
        };

        this.runningWorkerCount = 0;
    }

    public request(argument: ARGUMENT): Promise<RETURN_VALUE> {
        return this.requestWithAbort(argument).returnValue;
    }
    public requestWithAbort(argument: ARGUMENT): {
        id: string,
        returnValue: Promise<RETURN_VALUE>,
    } {
        const id = crypto.randomUUID();
        consoleWrap.log("job request", {
            id,
            argument,
        });
        return {
            id,
            returnValue: new Promise((resolve, reject): void => {
                this.jobWaitingQueue.pushAuto({
                    id,
                    argument,
                    resolve,
                    reject,
                });
                this.jobStart();
            }),
        };
    }

    public abort(id: string): void {
        {
            const waiting = this.jobWaitingQueue.delete(id);
            if (waiting != undefined) {
                consoleWrap.log("job abort (waiting)", {
                    id,
                    waiting,
                });
                waiting.reject(ErrJobAbort);
                return;
            }
        }

        const running = this.jobRunningQueue.delete(id);
        if (running == undefined) {
            consoleWrap.log("job abort (missing)", {
                id,
            });
            return;
        }

        consoleWrap.log("job abort (running)", {
            id,
            running,
        });
        running.signal.signal = "abort";
    }

    private async jobStart(): Promise<void> {
        if (this.runningWorkerCount >= this.opt.parallels) {
            return;
        }
        this.runningWorkerCount++;

        const workerID = crypto.randomUUID();
        consoleWrap.log("worker start", {
            workerID,
            runningJobCount: this.runningWorkerCount,
        });

        while (true) {
            const job = this.jobWaitingQueue.shift();
            if (job == undefined) {
                break;
            }

            const signal: tJobSignal = {
                signal: "none",
            };

            this.jobRunningQueue.pushAuto({
                id: job.id,
                signal: signal,
            });

            consoleWrap.log("worker job start", {
                workerID,
                job,
            });
            try {
                job.resolve(await this.jobFunc(job.argument, signal));
            } catch (err) {
                job.reject(err);
            }
            consoleWrap.log("worker job end", {
                workerID,
                job,
            });

            this.jobRunningQueue.delete(job.id);

            consoleWrap.log("worker sleep", {
                workerID,
                execInterval: this.opt.execInterval,
            });
            await sleep(this.opt.execInterval);
        }

        this.runningWorkerCount--;

        consoleWrap.log("worker end", {
            workerID,
            runningJobCount: this.runningWorkerCount,
        });
    }
}

type JobWait<ARGUMENT, RETURN_VALUE> = Readonly<{
    id: string,
    argument: ARGUMENT,
    resolve: (returnValue: RETURN_VALUE) => void,
    reject: (reason: any) => void,
}>;
type JobRunning = Readonly<{
    id: string,
    signal: tJobSignal,
}>;
type tJobSignal = {
    signal: "none" | "abort",
};

const ErrJobAbort = new Error("job abort");
