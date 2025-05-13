import { keyGenerateFromID, OrderObjectsAutoKey } from "../data/OrderObjectsAutoKey.js";
import { isJobMessageResponse, type Job, type tJobMessageRequest } from "./Job.js";

export { JobSender };

// TODO複数のjobを管理できるようにする、メッセージタイプとかつければ行けると思う
class JobSender<JOB_MAP extends Record<string, Job>> {
    private jobKeyList: (keyof JOB_MAP)[];
    private funcList: ConstructorParameters<typeof JobSender<JOB_MAP>>[0];

    private sendFunc: ConstructorParameters<typeof JobSender<JOB_MAP>>[1];

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
        sendFunc: (req: any) => void
    ) {
        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.sendFunc = sendFunc;

        this.waiting = new OrderObjectsAutoKey(keyGenerateFromID);
    }

    public Listener(response: unknown): boolean {
        console.log("message response", response);

        if (!isJobMessageResponse(response, this.jobKeyList)) {
            console.error("!isJobMessageReceive(response)");
            return false;
        }

        const waiting = this.waiting.getValue(response.id);
        if (waiting == undefined) {
            console.error("waiting == undefined");
            return false;
        }

        if (response.jobKey !== waiting.jobKey) {
            console.error("res.jobKey !== waiting.jobKey");
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

    public exec<JOB_KEY extends keyof JOB_MAP>(jobKey: JOB_KEY, data: JOB_MAP[JOB_KEY]["argument"]): Promise<JOB_MAP[JOB_KEY]["response"]> {
        console.log("message send", data);

        return new Promise((resolve, reject): void => {
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
                argument: data,
            }
            this.sendFunc(req);
        });
    }
}

type tPromiseHandlers<T> = {
    resolve: (result: T) => void,
    reject: (reason?: any) => void,
};
