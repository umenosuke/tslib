export { type PickByPrefix };

type PickByPrefix<T, Prefix extends string> = {
    [
    K in keyof T as K extends string
    ? (K extends `${Prefix}${string}` ? K : never)
    : never
    ]: T[K]
};
