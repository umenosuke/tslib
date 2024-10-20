import { test as utilTest } from "./util.test.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    try {
        errors.push(...(await utilTest()));
    } catch (e) {
        errors.push("utilTest => " + e);
    }

    return errors;
}
