import type { PrefixSuper } from "./PrefixSuper.js";
import type { tAddressFamily, tStringifyMode } from "./types.js";

export { IPSuper };

abstract class IPSuper {
    public abstract readonly adressFamily: tAddressFamily;

    constructor() { }

    public abstract getAddress(): bigint;
    public abstract getAddressStr(): string;

    public abstract getPrefix(): PrefixSuper;

    public abstract getSubnet(prefixLen: number): IPSuper | undefined;

    public abstract equal(n: IPSuper): boolean;
    public abstract sameNetwork(n: IPSuper): boolean;

    public abstract toString(mode?: tStringifyMode): string;
}
