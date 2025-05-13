import { isJobMessageRequest, type Job, type tJobMessageResponse } from "./Job.js";

export { JobReceiver };

class JobReceiver<JOB_MAP extends Record<string, Job>> {
    private jobKeyList: (keyof JOB_MAP)[];
    private funcList: ConstructorParameters<typeof JobReceiver<JOB_MAP>>[0];

    private responseSendFunc: ConstructorParameters<typeof JobReceiver<JOB_MAP>>[1];

    constructor(
        func: {
            [JOB_KEY in keyof JOB_MAP]: {
                job: (data: JOB_MAP[JOB_KEY]["argument"]) => Promise<JOB_MAP[JOB_KEY]["response"]>,
                typeGuard: (data: any) => data is JOB_MAP[JOB_KEY]['argument'],
            }
        },
        responseSendFunc: (req: any) => void,
    ) {
        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.responseSendFunc = responseSendFunc;
    }

    public async Listener(request: unknown): Promise<boolean> {
        console.log("request receive", request);

        if (!isJobMessageRequest(request, this.jobKeyList)) {
            console.error("!isJobMessageReceive(response)");
            return false;
        }

        if (!this.funcList[request.jobKey].typeGuard(request.argument)) {
            const res: tJobMessageResponse<typeof request.jobKey> = {
                id: request.id,
                success: false,
                jobKey: request.jobKey,
                errMsg: "!typeGuard[jobKey](argument)",
            }
            console.log("response send", res);
            this.responseSendFunc(res);
            return false;
        }

        try {
            const res: tJobMessageResponse<typeof request.jobKey> = {
                id: request.id,
                success: true,
                jobKey: request.jobKey,
                response: await this.funcList[request.jobKey].job(request.argument),
            }
            console.log("response send", res);
            this.responseSendFunc(res);
            return true;
        } catch (err) {
            const res: tJobMessageResponse<typeof request.jobKey> = {
                id: request.id,
                success: false,
                jobKey: request.jobKey,
                errMsg: String(err),
            }
            console.log("response send", res);
            this.responseSendFunc(res);
            return false;
        }
    }
}
