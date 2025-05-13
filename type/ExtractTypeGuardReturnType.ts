export { type ExtractTypeGuardReturnType };

type ExtractTypeGuardReturnType<T> = T extends (arg: any) => arg is infer R ? R : never;
