import { test as v4Test } from "./v4/v4.test.js"
import { test as v6Test } from "./v6/v6.test.js"

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    try {
        errors.push(...(await v4Test()).map((str) => { return " v4 => " + str; }));
    } catch (e) {
        errors.push("v4 => " + e);
    }

    try {
        errors.push(...(await v6Test()).map((str) => { return " v6 => " + str; }));
    } catch (e) {
        errors.push("v6 => " + e);
    }

    return errors;
}
