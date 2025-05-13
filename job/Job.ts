export { type Job, type tJobMessage, isJobMessage, type tJobMessageRequest, isJobMessageRequest, type tJobMessageResponse, isJobMessageResponse, isJobKey };

let debug = false;

type Job<ARGUMENT = any, RESPONSE = any> = {
    argument: ARGUMENT,
    response: RESPONSE,
};

type tJobMessage<JOB_KEY> = {
    id: string,
    jobKey: JOB_KEY,
}

function isJobMessage<JOB_KEY>(m: any, jobKeyList: JOB_KEY[]): m is tJobMessage<JOB_KEY> {
    if (m == undefined) {
        if (debug) {
            console.error("m == undefined");
        }
        return false;
    }

    if (typeof m.id !== "string") {
        if (debug) {
            console.error("typeof m.id !== \"string\"");
        }
        return false;
    }

    if (!isJobKey(m.jobKey, jobKeyList)) {
        if (debug) {
            console.error("!isJobKey(m.jobKey, jobKeyList)");
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
        if (debug) {
            console.error("m == undefined");
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
        if (debug) {
            console.error("m == undefined");
        }
        return false;
    }

    if (typeof m.success !== "boolean") {
        if (debug) {
            console.error("typeof m.success !== \"boolean\"");
        }
        return false;
    }
    if (m.success) {
        // response の型はなんでもいいので
    } else {
        if (typeof m.errMsg !== "string") {
            if (debug) {
                console.error("typeof m.errMsg !== \"string\"");
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
