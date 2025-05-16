import { ConsoleWrap } from "../console/ConsoleWrap.js";
import { isJobMessageRequest, type Job, type tJobMessageResponse } from "./Job.js";

export { JobReceiver };

const consoleWrap = new ConsoleWrap();
export const JobReceiverConsoleOption = consoleWrap.enables;

class JobReceiver<JOB_MAP extends Record<string, Job>, RESPONSE_SEND_AND_JOB_META> {
    private jobKeyList: (keyof JOB_MAP)[];
    private funcList: ConstructorParameters<typeof JobReceiver<JOB_MAP, RESPONSE_SEND_AND_JOB_META>>[0];

    private responseSendFunc: ConstructorParameters<typeof JobReceiver<JOB_MAP, RESPONSE_SEND_AND_JOB_META>>[1];

    constructor(
        func: {
            [JOB_KEY in keyof JOB_MAP]: {
                job: (data: JOB_MAP[JOB_KEY]["argument"], meta: RESPONSE_SEND_AND_JOB_META) => Promise<JOB_MAP[JOB_KEY]["returnValue"]>,
                typeGuard: (data: any) => data is JOB_MAP[JOB_KEY]['argument'],
            }
        },
        responseSendFunc: (response: tJobMessageResponse<keyof JOB_MAP>, meta: RESPONSE_SEND_AND_JOB_META) => Promise<void>,
    ) {
        this.jobKeyList = [];
        for (const jobKey in func) {
            this.jobKeyList.push(jobKey);
        };

        this.funcList = func;
        this.responseSendFunc = responseSendFunc;
    }

    public async Listener(request: unknown, meta: RESPONSE_SEND_AND_JOB_META): Promise<boolean> {
        consoleWrap.log("request receive", request);

        if (!isJobMessageRequest(request, this.jobKeyList)) {
            consoleWrap.error("!isJobMessageRequest(request)", {
                request: request,
                meta: meta,
                jobKeyList: this.jobKeyList,
            });
            return false;
        }

        try {
            if (!this.funcList[request.jobKey].typeGuard(request.argument)) {
                throw new Error("!typeGuard[jobKey](argument)");
            }
        } catch (errInternal) {
            consoleWrap.error("internal error", {
                request: request,
                meta: meta,
                err: errInternal,
            });

            const errResponse: tJobMessageResponse<typeof request.jobKey> = {
                messageType: "response",
                senderID: request.senderID,
                jobID: request.jobID,
                success: false,
                jobKey: request.jobKey,
                errMsg: String(errInternal),
            }

            try {
                consoleWrap.log("response send (job internal error)", errResponse);
                await this.responseSendFunc(errResponse, meta);
                return false;
            } catch (err) {
                consoleWrap.error("fail this.responseSendFunc (job internal error)", {
                    request: request,
                    errResponse: errResponse,
                    meta: meta,
                    err: err,
                });
                return false;
            }
        }

        try {
            const response: tJobMessageResponse<typeof request.jobKey> = {
                messageType: "response",
                senderID: request.senderID,
                jobID: request.jobID,
                success: true,
                jobKey: request.jobKey,
                returnValue: await this.funcList[request.jobKey].job(request.argument, meta),
            }

            try {
                consoleWrap.log("response send (job success)", response);
                await this.responseSendFunc(response, meta);
                return true;
            } catch (err) {
                consoleWrap.error("fail this.responseSendFunc (job success)", {
                    request: request,
                    response: response,
                    meta: meta,
                    err: err,
                });
                return false;
            }
        } catch (errJobReturn) {
            const errResponse: tJobMessageResponse<typeof request.jobKey> = {
                messageType: "response",
                senderID: request.senderID,
                jobID: request.jobID,
                success: false,
                jobKey: request.jobKey,
                errMsg: String(errJobReturn),
            }

            try {
                consoleWrap.log("response send (job fail)", errResponse);
                await this.responseSendFunc(errResponse, meta);
                return true;
            } catch (err) {
                consoleWrap.error("fail this.responseSendFunc (job fail)", {
                    request: request,
                    errResponse: errResponse,
                    meta: meta,
                    err: err,
                    errJobReturn: errJobReturn,
                });
                return false;
            }
        }
    }
}
