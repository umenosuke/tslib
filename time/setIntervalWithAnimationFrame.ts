import { TokenBucket } from "./TokenBucket.js";

export { setIntervalWithAnimationFrame };

function setIntervalWithAnimationFrame(handler: Function, timeout: number) {
    const bucket = new TokenBucket(timeout, 1000);

    const fnc = async () => {
        await bucket.tryConsumeWait(timeout);

        try {
            await handler();
        } catch (err) {
            console.error(err);
        }

        requestAnimationFrame(fnc);
    }

    fnc();
};
