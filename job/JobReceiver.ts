import { isJobMessageRequest, type Job, type tJobMessageResponse } from "./Job.js";

export { JobReceiver };

export const JobReceiverOption = {
    debug: false
};

class JobReceiver<JOB_MAP extends Record<string, Job>, RESPONSE_SEND_META> {
    private jobKeyList: (keyof JOB_MAP)[];
    private funcList: ConstructorParameters<typeof JobReceiver<JOB_MAP, RESPONSE_SEND_META>>[0];

    private responseSendFunc: ConstructorParameters<typeof JobReceiver<JOB_MAP, RESPONSE_SEND_META>>[1];

    constructor(
        func: {
            [JOB_KEY in keyof JOB_MAP]: {
                job: (data: JOB_MAP[JOB_KEY]["argument"], meta: RESPONSE_SEND_META) => Promise<JOB_MAP[JOB_KEY]["response"]>,
                typeGuard: (data: any) => data is JOB_MAP[JOB_KEY]['argument'],
            }
        },
        responseSendFunc: (req: tJobMessageResponse<keyof JOB_MAP>) => Promise<void>,
    ) {
        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.responseSendFunc = responseSendFunc;
    }

    public async Listener(request: unknown, meta: RESPONSE_SEND_META): Promise<boolean> {
        if (JobReceiverOption.debug) {
            console.log("request receive", request);
        }

        if (!isJobMessageRequest(request, this.jobKeyList)) {
            if (JobReceiverOption.debug) {
                console.error("!isJobMessageReceive(response)");
            }
            return false;
        }

        if (!this.funcList[request.jobKey].typeGuard(request.argument)) {
            const res: tJobMessageResponse<typeof request.jobKey> = {
                id: request.id,
                success: false,
                jobKey: request.jobKey,
                errMsg: "!typeGuard[jobKey](argument)",
            }
            if (JobReceiverOption.debug) {
                console.log("response send", res);
            }
            await this.responseSendFunc(res);
            return false;
        }

        try {
            const res: tJobMessageResponse<typeof request.jobKey> = {
                id: request.id,
                success: true,
                jobKey: request.jobKey,
                response: await this.funcList[request.jobKey].job(request.argument, meta),
            }
            if (JobReceiverOption.debug) {
                console.log("response send", res);
            }
            await this.responseSendFunc(res);
            return true;
        } catch (err) {
            const res: tJobMessageResponse<typeof request.jobKey> = {
                id: request.id,
                success: false,
                jobKey: request.jobKey,
                errMsg: String(err),
            }
            if (JobReceiverOption.debug) {
                console.log("response send", res);
            }
            await this.responseSendFunc(res);
            return false;
        }
    }
}
