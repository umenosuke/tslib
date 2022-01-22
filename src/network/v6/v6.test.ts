import { test as utilTest } from "./util.test.js"
import { test as parserTest } from "./parser.test.js"

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    errors.push(...(await utilTest()));
    errors.push(...(await parserTest()));

    return errors;
}
