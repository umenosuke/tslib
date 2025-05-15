export { type Job, type tJobMessage, isJobMessage, type tJobMessageRequest, isJobMessageRequest, type tJobMessageResponse, isJobMessageResponse, isJobKey };

export const JobConsoleOption = {
    warn: false,
};

type Job<ARGUMENT = any, RESPONSE = any> = {
    argument: ARGUMENT,
    response: RESPONSE,
};

type tJobMessage<JOB_KEY> = {
    sendorID: string,
    jobID: string,
    jobKey: JOB_KEY,
}

function isJobMessage<JOB_KEY>(m: any, jobKeyList: JOB_KEY[]): m is tJobMessage<JOB_KEY> {
    if (m == undefined) {
        if (JobConsoleOption.warn) {
            console.warn("m == undefined");
        }
        return false;
    }

    if (typeof m.sendorID !== "string") {
        if (JobConsoleOption.warn) {
            console.warn("typeof m.sendorID !== \"string\"");
        }
        return false;
    }

    if (typeof m.jobID !== "string") {
        if (JobConsoleOption.warn) {
            console.warn("typeof m.jobID !== \"string\"");
        }
        return false;
    }

    if (!isJobKey(m.jobKey, jobKeyList)) {
        if (JobConsoleOption.warn) {
            console.warn("!isJobKey(m.jobKey, jobKeyList)");
        }
        return false;
    }

    return true;
}

type tJobMessageRequest<JOB_KEY> = {
    argument: unknown,
} & tJobMessage<JOB_KEY>;

function isJobMessageRequest<JOB_KEY>(m: any, jobKeyList: JOB_KEY[]): m is tJobMessageRequest<JOB_KEY> {
    if (m == undefined) {
        if (JobConsoleOption.warn) {
            console.warn("m == undefined");
        }
        return false;
    }

    // argument の型はなんでもいいので

    return isJobMessage(m, jobKeyList);
}

type tJobMessageResponse<JOB_KEY> = {
    success: true,
    response: unknown,
} & tJobMessage<JOB_KEY> | {
    success: false,
    errMsg: string,
} & tJobMessage<JOB_KEY>;

function isJobMessageResponse<JOB_KEY>(m: any, jobKeyList: JOB_KEY[]): m is tJobMessageResponse<JOB_KEY> {
    if (m == undefined) {
        if (JobConsoleOption.warn) {
            console.warn("m == undefined");
        }
        return false;
    }

    if (typeof m.success !== "boolean") {
        if (JobConsoleOption.warn) {
            console.warn("typeof m.success !== \"boolean\"");
        }
        return false;
    }
    if (m.success) {
        // response の型はなんでもいいので
    } else {
        if (typeof m.errMsg !== "string") {
            if (JobConsoleOption.warn) {
                console.warn("typeof m.errMsg !== \"string\"");
            }
            return false;
        }
    }

    return isJobMessage(m, jobKeyList);
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
