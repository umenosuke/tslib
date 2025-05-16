import { ConsoleWrap } from "../console/ConsoleWrap.js";
import { isJobMessageRequest, type Job, type tJobMessageResponse } from "./Job.js";

export { JobReceiver };

const consoleWrap = new ConsoleWrap();
export const JobReceiverConsoleOption = consoleWrap.enables;

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
        responseSendFunc: (response: tJobMessageResponse<keyof JOB_MAP>) => Promise<void>,
    ) {
        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.responseSendFunc = responseSendFunc;
    }

    public async Listener(request: unknown, meta: RESPONSE_SEND_META): Promise<boolean> {
        consoleWrap.log("request receive", request);

        if (!isJobMessageRequest(request, this.jobKeyList)) {
            consoleWrap.error("!isJobMessageRequest(request)", {
                request: request,
                jobKeyList: this.jobKeyList,
            });
            return false;
        }

        try {
            if (!this.funcList[request.jobKey].typeGuard(request.argument)) {
                throw new Error("!typeGuard[jobKey](argument)");
            }

            const response: tJobMessageResponse<typeof request.jobKey> = {
                senderID: request.senderID,
                jobID: request.jobID,
                success: true,
                jobKey: request.jobKey,
                response: await this.funcList[request.jobKey].job(request.argument, meta),
            }

            consoleWrap.log("response send", response);
            await this.responseSendFunc(response);
            return true;
        } catch (err) {
            try {
                const response: tJobMessageResponse<typeof request.jobKey> = {
                    senderID: request.senderID,
                    jobID: request.jobID,
                    success: false,
                    jobKey: request.jobKey,
                    errMsg: String(err),
                }

                consoleWrap.log("response send", response);
                await this.responseSendFunc(response);
            } catch (err) {
                consoleWrap.error("fail this.responseSendFunc", {
                    err: err,
                });
            }
            return false;
        }
    }
}
