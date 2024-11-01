export { type RecursiveRequired };

type RecursiveRequired<T> = {
    [K in keyof T]-?: Exclude<RecursiveRequired<T[K]>, undefined | null>;
};
