export { type RecursivePartial };

type RecursivePartial<T> = {
    [K in keyof T]?: T[K] extends object ? RecursivePartial<T[K]> | null : RecursivePartial<T[K]>;
};
