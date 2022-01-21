import { test as v4Test } from "./v4/v4.test.js"

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    errors.push(...(await v4Test()));

    return errors;
}
