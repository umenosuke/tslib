import type { Prefix } from "./Prefix.js";
import type { eAddressFamily, eStringifyMode } from "./enum.js";

export { IPSuper };

abstract class IPSuper {
    public abstract readonly adressFamily: eAddressFamily;

    constructor() { }

    public abstract getAddress(): bigint;
    public abstract getAddressStr(): string;

    public abstract getPrefix(): Prefix;

    public abstract getSubnet(prefixLen: number): IPSuper | undefined;

    public abstract equal(n: IPSuper): boolean;
    public abstract sameNetwork(n: IPSuper): boolean;

    public abstract toString(mode: eStringifyMode): string;
}
