import { sleep } from "./sleep.js";

export { TokenBucket };

class TokenBucket {
    private readonly capacity: number;
    private readonly refillRatePerSec: number;

    private tokens: number;

    private lastRefillTime: number;

    constructor(capacity: number, refillRatePerSec: number) {
        this.capacity = capacity;
        this.refillRatePerSec = refillRatePerSec;

        this.tokens = capacity;

        this.lastRefillTime = Date.now();
    }

    private refillTokens(): void {
        const now = Date.now();
        const delta = now - this.lastRefillTime;

        const tokensToAdd = this.refillRatePerSec * (delta / 1000);
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);

        this.lastRefillTime = now;
    }

    public tryConsume(tokenNum: number): boolean {
        if (tokenNum > this.capacity) {
            throw new Error("tokenNum > this.capacity");
        }

        this.refillTokens();

        if (this.tokens < tokenNum) {
            return false;
        }

        this.tokens -= tokenNum;
        return true;
    }

    public async tryConsumeWait(tokenNum: number): Promise<void> {
        if (tokenNum > this.capacity) {
            throw new Error("tokenNum > this.capacity");
        }

        while (true) {
            this.refillTokens();

            if (this.tokens >= tokenNum) {
                this.tokens -= tokenNum;
                return;
            }

            const insufficient = tokenNum - this.tokens;
            await sleep((insufficient / this.refillRatePerSec) * 1000);
        }
    }
}
