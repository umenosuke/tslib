import { keyGenerateFromID, OrderObjectsAutoKey } from "../data/OrderObjectsAutoKey.js";
import { isJobMessageResponse, type Job, type tJobMessageRequest } from "./Job.js";

export { JobSender };

export const JobSenderOption = {
    debug: false
};

// TODO複数のjobを管理できるようにする、メッセージタイプとかつければ行けると思う
class JobSender<JOB_MAP extends Record<string, Job>, REQUEST_SEND_META> {
    private jobKeyList: (keyof JOB_MAP)[];
    private funcList: ConstructorParameters<typeof JobSender<JOB_MAP, REQUEST_SEND_META>>[0];

    private requestSendFunc: ConstructorParameters<typeof JobSender<JOB_MAP, REQUEST_SEND_META>>[1];

    private waiting: OrderObjectsAutoKey<string, {
        id: string,
        jobKey: keyof JOB_MAP,
        p: tPromiseHandlers<JOB_MAP[keyof JOB_MAP]['response']>,
    }>;

    constructor(
        func: {
            [JOB_KEY in keyof JOB_MAP]: {
                typeGuard: (res: any) => res is JOB_MAP[JOB_KEY]['response'];
            }
        },
        requestSendFunc: (req: tJobMessageRequest<keyof JOB_MAP>, meta: REQUEST_SEND_META) => Promise<void>,
    ) {
        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.requestSendFunc = requestSendFunc;

        this.waiting = new OrderObjectsAutoKey(keyGenerateFromID);
    }

    public Listener(response: unknown): boolean {
        if (JobSenderOption.debug) {
            console.log("response receive", response);
        }

        if (!isJobMessageResponse(response, this.jobKeyList)) {
            if (JobSenderOption.debug) {
                console.error("!isJobMessageReceive(response)");
            }
            return false;
        }

        const waiting = this.waiting.getValue(response.id);
        if (waiting == undefined) {
            if (JobSenderOption.debug) {
                console.error("waiting == undefined");
            }
            return false;
        }

        if (response.jobKey !== waiting.jobKey) {
            if (JobSenderOption.debug) {
                console.error("res.jobKey !== waiting.jobKey");
            }
            return false;
        }

        if (!response.success) {
            waiting.p.reject(new Error(response.errMsg));
            return false;
        }

        if (!this.funcList[response.jobKey].typeGuard(response.response)) {
            waiting.p.reject(new Error("!typeGuard[jobKey](response)"));
            return false;
        }

        waiting.p.resolve(response.response);
        return true;
    };

    public request<JOB_KEY extends keyof JOB_MAP>(jobKey: JOB_KEY, argument: JOB_MAP[JOB_KEY]["argument"], meta: REQUEST_SEND_META): Promise<JOB_MAP[JOB_KEY]["response"]> {
        return new Promise(async (resolve, reject): Promise<void> => {
            const id = crypto.randomUUID();
            this.waiting.pushAuto({
                id: id,
                jobKey: jobKey,
                p: {
                    resolve: resolve,
                    reject: reject,
                },
            });

            const req: tJobMessageRequest<JOB_KEY> = {
                id: id,
                jobKey: jobKey,
                argument: argument,
            }
            if (JobSenderOption.debug) {
                console.log("request send", req);
            }
            await this.requestSendFunc(req, meta);
        });
    }
}

type tPromiseHandlers<T> = {
    resolve: (result: T) => void,
    reject: (reason?: any) => void,
};
