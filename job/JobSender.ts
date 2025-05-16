import { ConsoleWrap } from "../console/ConsoleWrap.js";
import { OrderObjectsAutoKey } from "../data/OrderObjectsAutoKey.js";
import { isJobMessageResponse, type Job, type tJobMessageRequest } from "./Job.js";

export { JobSender };

const consoleWrap = new ConsoleWrap();
export const JobSenderConsoleOption = consoleWrap.enables;

// TODO複数のjobを管理できるようにする、メッセージタイプとかつければ行けると思う
class JobSender<JOB_MAP extends Record<string, Job>, REQUEST_SEND_META> {
    private senderID: string;

    private jobKeyList: (keyof JOB_MAP)[];
    private funcList: ConstructorParameters<typeof JobSender<JOB_MAP, REQUEST_SEND_META>>[0];

    private requestSendFunc: ConstructorParameters<typeof JobSender<JOB_MAP, REQUEST_SEND_META>>[1];

    private waitingJobList: OrderObjectsAutoKey<string, {
        jobID: string,
        jobKey: keyof JOB_MAP,
        p: tPromiseHandlers<JOB_MAP[keyof JOB_MAP]['returnValue']>,
    }>;

    constructor(
        func: {
            [JOB_KEY in keyof JOB_MAP]: {
                typeGuard: (returnValue: any) => returnValue is JOB_MAP[JOB_KEY]['returnValue'];
            }
        },
        requestSendFunc: (request: tJobMessageRequest<keyof JOB_MAP>, meta: REQUEST_SEND_META) => Promise<void>,
    ) {
        this.senderID = crypto.randomUUID();

        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.requestSendFunc = requestSendFunc;

        this.waitingJobList = new OrderObjectsAutoKey(v => v.jobID);
    }

    public Listener(response: unknown): boolean {
        consoleWrap.log("response receive", response);

        if (!isJobMessageResponse(response, this.jobKeyList)) {
            consoleWrap.error("!isJobMessageResponse(response)", {
                response: response,
                jobKeyList: this.jobKeyList,
            });
            return false;
        }

        if (response.senderID !== this.senderID) {
            return true;
        }

        const waiting = this.waitingJobList.delete(response.jobID);
        if (waiting == undefined) {
            consoleWrap.error("waiting == undefined");
            return false;
        }

        if (response.jobKey !== waiting.jobKey) {
            consoleWrap.error("response.jobKey !== waiting.jobKey", {
                response: response,
                waiting: waiting,
            });
            return false;
        }

        if (!response.success) {
            waiting.p.reject(new Error(response.errMsg));
            return false;
        }

        if (!this.funcList[response.jobKey].typeGuard(response.returnValue)) {
            consoleWrap.error("!typeGuard[jobKey](response.returnValue)", {
                response: response,
            });
            waiting.p.reject(new Error("!typeGuard[jobKey](response.returnValue)"));
            return false;
        }

        waiting.p.resolve(response.returnValue);
        return true;
    };

    public request<JOB_KEY extends keyof JOB_MAP>(jobKey: JOB_KEY, argument: JOB_MAP[JOB_KEY]["argument"], meta: REQUEST_SEND_META): Promise<JOB_MAP[JOB_KEY]["returnValue"]> {
        return new Promise(async (resolve, reject): Promise<void> => {
            const jobID = crypto.randomUUID();
            this.waitingJobList.pushAuto({
                jobID: jobID,
                jobKey: jobKey,
                p: {
                    resolve: resolve,
                    reject: reject,
                },
            });

            try {
                const request: tJobMessageRequest<JOB_KEY> = {
                    senderID: this.senderID,
                    jobID: jobID,
                    jobKey: jobKey,
                    argument: argument,
                }

                consoleWrap.log("request send", request);
                await this.requestSendFunc(request, meta);
            } catch (err) {
                consoleWrap.error("fail this.requestSendFunc", {
                    err: err,
                });
                this.waitingJobList.delete(jobID);
                reject(err);
            }
        });
    }
}

type tPromiseHandlers<T> = {
    resolve: (result: T) => void,
    reject: (reason?: any) => void,
};
