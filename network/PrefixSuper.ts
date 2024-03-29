import type { IPSuper } from "./IPSuper.js";
import type { tAddressFamily, tStringifyMode } from "./types.js";

export { PrefixSuper };

abstract class PrefixSuper {
    public abstract readonly adressFamily: tAddressFamily;

    constructor() { }

    public abstract equal(n: PrefixSuper): boolean;
    public abstract include(p: PrefixSuper): boolean;

    public abstract getNetworkAddress(): bigint;
    public abstract getNetworkAddressStr(): string;

    public abstract getBroadcastAddress(): bigint;
    public abstract getBroadcastAddressStr(): string;

    public abstract getMask(): bigint;
    public abstract getMaskStr(): string;

    public abstract getWildcard(): bigint;
    public abstract getWildcardStr(): string;

    public abstract getPrefixLen(): number;
    public abstract getPrefixLenStr(): string;

    public abstract getAddressNum(): number;

    public abstract getHosts(range: { seek?: bigint, maxNum?: bigint }): IPSuper[];

    public abstract split(prefixLength: number): PrefixSuper[];

    public abstract toString(mode?: tStringifyMode): string;
}
