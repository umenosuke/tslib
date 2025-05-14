import { TokenBucket } from "./TokenBucket.js";

export { setIntervalWithAnimationFrame, clearIntervalWithAnimationFrame };

const runningIDs = new Set<ReturnType<typeof crypto.randomUUID>>();

function setIntervalWithAnimationFrame(handler: Function, timeout: number): ReturnType<typeof crypto.randomUUID> {
    const id = crypto.randomUUID();
    const bucket = new TokenBucket(timeout, 1000);

    runningIDs.add(id);

    const fnc = async () => {
        await bucket.tryConsumeWait(timeout);
        if (!runningIDs.has(id)) {
            return;
        }

        try {
            await handler();
        } catch (err) {
            console.error(err);
        }

        requestAnimationFrame(fnc);
    }

    fnc();

    return id;
};

function clearIntervalWithAnimationFrame(id: ReturnType<typeof crypto.randomUUID> | undefined | null): void {
    if (id == undefined) {
        return;
    }

    runningIDs.delete(id);
};
