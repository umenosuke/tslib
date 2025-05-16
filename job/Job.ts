import { ConsoleWrap } from "../console/ConsoleWrap.js";

export { type Job, type tJobMessage, isJobMessage, type tJobMessageRequest, isJobMessageRequest, type tJobMessageResponse, isJobMessageResponse, isJobKey };

const consoleWrap = new ConsoleWrap();
export const JobConsoleOption = consoleWrap.enables;

type Job<ARGUMENT = any, RETURN_VALUE = any> = {
    argument: ARGUMENT,
    returnValue: RETURN_VALUE,
};

type tJobMessage<JOB_KEY> = {
    senderID: string,
    jobID: string,
    jobKey: JOB_KEY,
}

function isJobMessage<JOB_KEY>(message: any, jobKeyList: JOB_KEY[]): message is tJobMessage<JOB_KEY> {
    if (message == undefined) {
        consoleWrap.warn("message == undefined", {
            message: message,
        });
        return false;
    }

    if (typeof message.senderID !== "string") {
        consoleWrap.warn("typeof message.senderID !== \"string\"", {
            message: message,
        });
        return false;
    }

    if (typeof message.jobID !== "string") {
        consoleWrap.warn("typeof message.jobID !== \"string\"", {
            message: message,
        });
        return false;
    }

    if (!isJobKey(message.jobKey, jobKeyList)) {
        consoleWrap.warn("!isJobKey(message.jobKey, jobKeyList)", {
            message: message,
            jobKeyList: jobKeyList,
        });
        return false;
    }

    return true;
}

type tJobMessageRequest<JOB_KEY> = {
    argument: unknown,
} & tJobMessage<JOB_KEY>;

function isJobMessageRequest<JOB_KEY>(request: any, jobKeyList: JOB_KEY[]): request is tJobMessageRequest<JOB_KEY> {
    if (request == undefined) {
        consoleWrap.warn("request == undefined", {
            message: request,
        });
        return false;
    }

    // argument の型はなんでもいいので

    return isJobMessage(request, jobKeyList);
}

type tJobMessageResponse<JOB_KEY> = {
    success: true,
    returnValue: unknown,
} & tJobMessage<JOB_KEY> | {
    success: false,
    errMsg: string,
} & tJobMessage<JOB_KEY>;

function isJobMessageResponse<JOB_KEY>(response: any, jobKeyList: JOB_KEY[]): response is tJobMessageResponse<JOB_KEY> {
    if (response == undefined) {
        consoleWrap.warn("response == undefined", {
            response: response,
        });
        return false;
    }

    if (typeof response.success !== "boolean") {
        consoleWrap.warn("typeof response.success !== \"boolean\"", {
            response: response,
        });
        return false;
    }
    if (response.success) {
        // returnValue の型はなんでもいいので
    } else {
        if (typeof response.errMsg !== "string") {
            consoleWrap.warn("typeof response.errMsg !== \"string\"", {
                response: response,
            });
            return false;
        }
    }

    return isJobMessage(response, jobKeyList);
}

function isJobKey<JOB_KEY>(key: any, jobKeyList: JOB_KEY[]): key is JOB_KEY {
    if (key == undefined) {
        return false;
    }

    for (const jobKey of jobKeyList) {
        if (key === jobKey) {
            return true;
        }
    }

    return false;
}
