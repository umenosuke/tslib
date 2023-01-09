import type { IP } from "./IP.js";
import type { eAddressFamily, eStringifyMode } from "./enum.js";

export { PrefixSuper };

abstract class PrefixSuper {
    public abstract readonly adressFamily: eAddressFamily;

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

    public abstract getHosts(range: { seek?: bigint, maxNum?: bigint }): IP[];

    public abstract split(prefixLength: number): PrefixSuper[];

    public abstract toString(mode: eStringifyMode): string;
}
