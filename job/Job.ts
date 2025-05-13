export { type Job, type tJobMessageRequest, isJobMessageRequest, type tJobMessageResponse, isJobMessageResponse, isJobKey };

type Job<ARGUMENT = any, RESPONSE = any> = {
    argument: ARGUMENT,
    response: RESPONSE,
};

type tJobMessageRequest<JOB_KEY> = {
    id: string,
    jobKey: JOB_KEY,
    argument: unknown,
};

function isJobMessageRequest<JOB_KEY>(m: any, jobKeyList: JOB_KEY[]): m is tJobMessageRequest<JOB_KEY> {
    if (m == undefined) {
        console.error("m == undefined");
        return false;
    }

    if (typeof m.id !== "string") {
        console.error("typeof m.id !== \"string\"");
        return false;
    }

    if (!isJobKey(m.jobKey, jobKeyList)) {
        console.error("!isJobKey(m.jobKey, jobKeyList)");
        return false;
    }

    // argument の型はなんでもいいので

    return true;
}

type tJobMessageResponse<JOB_KEY> = {
    id: string,
    jobKey: JOB_KEY,
    success: true,
    response: unknown,
} | {
    id: string,
    jobKey: JOB_KEY,
    success: false,
    errMsg: string,
};

function isJobMessageResponse<JOB_KEY>(m: any, jobKeyList: JOB_KEY[]): m is tJobMessageResponse<JOB_KEY> {
    if (m == undefined) {
        console.error("m == undefined");
        return false;
    }

    if (typeof m.id !== "string") {
        console.error("typeof m.id !== \"string\"");
        return false;
    }

    if (!isJobKey(m.jobKey, jobKeyList)) {
        console.error("!isJobKey(m.jobKey, jobKeyList)");
        return false;
    }

    if (typeof m.success !== "boolean") {
        console.error("typeof m.success !== \"boolean\"");
        return false;
    }
    if (m.success) {
        // response の型はなんでもいいので
    } else {
        if (typeof m.errMsg !== "string") {
            console.error("typeof m.errMsg !== \"string\"");
            return false;
        }
    }

    return true;
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
