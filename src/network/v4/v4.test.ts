import { test as utilTest } from "./util.test.js"

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    errors.push(...(await utilTest()));

    return errors;
}
