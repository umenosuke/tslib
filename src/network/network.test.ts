import { test as v4Test } from "./v4/v4.test.js"
import { test as v6Test } from "./v6/v6.test.js"

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    errors.push(...(await v4Test()).map((str) => { return " v4 => " + str; }));
    errors.push(...(await v6Test()).map((str) => { return " v6 => " + str; }));

    return errors;
}
