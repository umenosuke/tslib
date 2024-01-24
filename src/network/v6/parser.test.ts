import type { tParseMode } from "../types.js";
import { parseIP } from "./parser.js";
import { BITS } from "./util.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    {
        const msgPrefix = "prefixNum2Bits";

        function equalData(a: { address: bigint, mask: bigint }, b: { address: bigint, mask: bigint }) {
            return a.address === b.address && a.mask === b.mask;
        }

        for (const data of <{ input: { str: string, mode: tParseMode }, expect: { address: bigint, mask: bigint } }[]>[
            { input: { str: null, mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: null }, expect: { address: undefined, mask: undefined } },
            { input: { str: undefined, mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: undefined }, expect: { address: undefined, mask: undefined } },



            { input: { str: "a:::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::", mode: "host" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },



            { input: { str: "a:::/", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::/", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::/", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::/", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::/a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::/a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::/a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::/a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::/0", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/0", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/0", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/0", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/0", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::/0", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/0", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/0", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/0", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/0", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::/0", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/0", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/0", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/0", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/0", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::/0", mode: "auto" }, expect: { address: 0n, mask: 0n } },
            { input: { str: "::/0", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/0", mode: "prefix" }, expect: { address: 0n, mask: 0n } },
            { input: { str: "::/0", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/0", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0", mode: "auto" }, expect: { address: BITS, mask: 0n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0", mode: "prefix" }, expect: { address: BITS, mask: 0n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/0", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::/128", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/128", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/128", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/128", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/128", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::/128", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/128", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/128", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/128", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/128", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::/128", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/128", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/128", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/128", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/128", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::/128", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::/128", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/128", mode: "prefix" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::/128", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/128", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128", mode: "prefix" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::/129", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/129", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/129", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/129", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::/129", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::/129", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/129", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/129", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/129", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::/129", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::/129", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/129", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/129", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/129", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::/129", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::/129", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/129", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/129", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/129", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::/129", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/129", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/129", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/129", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/129", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/129", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },



            { input: { str: "a::: ", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: ", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: ", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: ", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: ":: ", mode: "host" }, expect: { address: 0n, mask: BITS } },
            { input: { str: ":: ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ", mode: "host" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: " a:::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " a:::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " a:::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " a:::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " a:::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: " z:::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " z:::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " z:::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " z:::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " z:::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: " :::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " :::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " :::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " :::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " :::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: " ::", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: " ::", mode: "host" }, expect: { address: 0n, mask: BITS } },
            { input: { str: " ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: " ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: " ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: BITS, mask: BITS } },
            { input: { str: " ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: " ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a::: a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a::: ::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: ::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: ::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: ::", mode: "auto" }, expect: { address: 0n, mask: 0n } },
            { input: { str: ":: ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ::", mode: "subnetMask" }, expect: { address: 0n, mask: 0n } },
            { input: { str: ":: ::", mode: "wildcardBit" }, expect: { address: 0n, mask: BITS } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::", mode: "auto" }, expect: { address: BITS, mask: 0n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::", mode: "subnetMask" }, expect: { address: BITS, mask: 0n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::", mode: "wildcardBit" }, expect: { address: BITS, mask: BITS } },


            { input: { str: "a::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: ":: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: 0n, mask: BITS } },
            { input: { str: ":: ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: 0n, mask: 0n } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: BITS, mask: 0n } },


            { input: { str: "a::: ::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: ::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: ::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: ::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: ::1", mode: "auto" }, expect: { address: 0n, mask: BITS - 1n } },
            { input: { str: ":: ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ::1", mode: "wildcardBit" }, expect: { address: 0n, mask: BITS - 1n } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::1", mode: "auto" }, expect: { address: BITS, mask: BITS - 1n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ::1", mode: "wildcardBit" }, expect: { address: BITS, mask: BITS - 1n } },


            { input: { str: "a::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: 0n, mask: 170141183460469231731687303715884105728n } },
            { input: { str: ":: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: 0n, mask: 170141183460469231731687303715884105728n } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: 170141183460469231731687303715884105728n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: BITS, mask: 170141183460469231731687303715884105728n } },


            { input: { str: "a::: 8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: 8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: 8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: 8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: 8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: 8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: 8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff 8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z::: 7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z::: 7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":: ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },



            { input: { str: "a:::    ", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    ", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    ", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    ", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::    ", mode: "host" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::    ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ", mode: "host" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "    a:::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    a:::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    a:::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    a:::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    a:::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "    z:::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    z:::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    z:::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    z:::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    z:::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "    :::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    :::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    :::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    :::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    :::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "    ::", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "    ::", mode: "host" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "    ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::    a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    a", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    a", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    a", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    a", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    a", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::    ::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    ::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    ::", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    ::", mode: "auto" }, expect: { address: 0n, mask: 0n } },
            { input: { str: "::    ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ::", mode: "subnetMask" }, expect: { address: 0n, mask: 0n } },
            { input: { str: "::    ::", mode: "wildcardBit" }, expect: { address: 0n, mask: BITS } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::", mode: "auto" }, expect: { address: BITS, mask: 0n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::", mode: "subnetMask" }, expect: { address: BITS, mask: 0n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::", mode: "wildcardBit" }, expect: { address: BITS, mask: BITS } },


            { input: { str: "a:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: 0n, mask: BITS } },
            { input: { str: "::    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: 0n, mask: 0n } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: BITS, mask: BITS } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: BITS, mask: 0n } },


            { input: { str: "a:::    ::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    ::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    ::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    ::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    ::1", mode: "auto" }, expect: { address: 0n, mask: BITS - 1n } },
            { input: { str: "::    ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ::1", mode: "wildcardBit" }, expect: { address: 0n, mask: BITS - 1n } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::1", mode: "auto" }, expect: { address: BITS, mask: BITS - 1n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ::1", mode: "wildcardBit" }, expect: { address: BITS, mask: BITS - 1n } },


            { input: { str: "a:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: 0n, mask: 170141183460469231731687303715884105728n } },
            { input: { str: "::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: 0n, mask: 170141183460469231731687303715884105728n } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: BITS, mask: 170141183460469231731687303715884105728n } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    7fff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: BITS, mask: 170141183460469231731687303715884105728n } },


            { input: { str: "a:::    8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    8::1", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    8::1", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    8::1", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    8::1", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    8::1", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },


            { input: { str: "a:::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "a:::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "z:::    7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "z:::    7fff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: ":::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: ":::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "::    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },

            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "auto" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "host" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "prefix" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "subnetMask" }, expect: { address: undefined, mask: undefined } },
            { input: { str: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff    ffff:ffff:ffff::ffff:ffff:ffff:ffff", mode: "wildcardBit" }, expect: { address: undefined, mask: undefined } },
        ]) {
            const check = parseIP(data.input?.str, data.input?.mode);
            if (!equalData(check, data.expect)) {
                const msg = msgPrefix + " => 失敗っぽい「" + data.input.str + ", " + data.input.mode + "」が「" + data.expect.address + ", " + data.expect.mask + "」じゃなく「" + check.address + ", " + check.mask + "」になっている";
                errors.push(msg);
            }
        }
    }

    return errors;
}
