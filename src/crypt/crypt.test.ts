import { test as UnixCryptTest } from "./UnixCrypt.test.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    errors.push(...(await UnixCryptTest()));

    return errors;
}
