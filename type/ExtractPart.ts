export { type ExtractPart };

type ExtractPart<TYPE, KEY extends keyof TYPE> = TYPE[KEY];
