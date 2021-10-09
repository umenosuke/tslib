import { uint8ArrayConcat } from "../data/uint8ArrayConcat.js";
import { tHashTypeList, HASH_TYPE_DEFAULT, SALT_NOT_ALLOWED_CHAR, ROUNDS_MAX, ROUNDS_MIN, ROUNDS_DEFAULT } from "./UnixCryptConsts.js";

export { UnixCryptConfig, UnixCrypt };

// https://akkadia.org/drepper/SHA-crypt.txt
// https://github.com/markusberg/unixcrypt
// を参考にさせていただきました

const DICTIONARY = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

type tHashType = {
    "id": string,
    "name": tHashTypeList,
    "digestLength": number,
    "encodePadding": number,
    "encodeMap": number[][]
};
const HASH_TYPES: { [key in tHashTypeList]: tHashType } = {
    "SHA-512": {
        "id": "6",
        "name": "SHA-512",
        "digestLength": 64,
        "encodePadding": 2,
        "encodeMap":
            [[42, 21, 0],
            [1, 43, 22],
            [23, 2, 44],
            [45, 24, 3],
            [4, 46, 25],
            [26, 5, 47],
            [48, 27, 6],
            [7, 49, 28],
            [29, 8, 50],
            [51, 30, 9],
            [10, 52, 31],
            [32, 11, 53],
            [54, 33, 12],
            [13, 55, 34],
            [35, 14, 56],
            [57, 36, 15],
            [16, 58, 37],
            [38, 17, 59],
            [60, 39, 18],
            [19, 61, 40],
            [41, 20, 62],
            [63, 64, 64]]
    }
};

class UnixCryptConfig {
    private _hashType: tHashType;
    public setHashType(name: tHashTypeList) {
        if (name == undefined) {
            console.error("input error : ", name);
            return;
        }
        if (HASH_TYPES[name] == undefined) {
            console.error("invalid name : ", name);
            return;
        }

        this._hashType = HASH_TYPES[name];
    }
    public get hashType(): tHashType {
        return this._hashType;
    }

    private _salt: string;
    public set salt(salt: string) {
        if (salt == undefined) {
            console.error("input error : ", salt);
            return;
        }

        if (salt.match(SALT_NOT_ALLOWED_CHAR)) {
            console.error("input error, not allowed char : ", salt);
            return;
        }

        if (salt.length > 16) {
            console.warn("truncated becouse too long : ", salt);
            salt = salt.slice(0, 16);
        }

        this._salt = salt;
    }
    public get salt(): string {
        return this._salt;
    }


    private _rounds: number;
    public set rounds(rounds: number) {
        if (rounds == undefined) {
            console.error("input error : ", rounds);
            return;
        }

        if (rounds > ROUNDS_MAX) {
            console.warn("clamp within range : ", rounds);
            rounds = ROUNDS_MAX;
        } else if (rounds < ROUNDS_MIN) {
            console.warn("clamp within range : ", rounds);
            rounds = ROUNDS_MIN;
        }

        this._rounds = rounds;
    }
    public get rounds(): number {
        return this._rounds;
    }

    public constructor(param: {
        typeName?: tHashTypeList; salt?: string; rounds?: number
    } = {}) {
        this.setHashType(HASH_TYPE_DEFAULT);
        if (param.typeName != undefined) {
            this.setHashType(param.typeName);
        }

        if (param.salt != undefined) {
            this.salt = param.salt;
        } else {
            this.setSaltRandom();
        }

        if (param.rounds != undefined) {
            this.rounds = param.rounds;
        } else {
            this.rounds = ROUNDS_DEFAULT;
        }
    }

    public setSaltRandom(): void {
        let randSalt = "";

        const rand = crypto.getRandomValues(new Uint8Array(16));
        for (const num of rand) {
            randSalt += DICTIONARY.charAt(num & 0b00111111);
        }

        this.salt = randSalt;
    }
}

class UnixCrypt {
    private static async generateDigest(config: UnixCryptConfig, byteList: Uint8Array[]): Promise<Uint8Array> {
        return new Uint8Array(await crypto.subtle.digest(config.hashType.name, uint8ArrayConcat(byteList)));
    }

    private static async generateDigestA(config: UnixCryptConfig, passwordByte: Uint8Array, saltByte: Uint8Array): Promise<Uint8Array> {
        // step 1 - 3
        const byteListA: Uint8Array[] = [];
        byteListA.push(passwordByte);
        byteListA.push(saltByte);

        // step 4 - 8
        const digestB = await UnixCrypt.generateDigestB(config, passwordByte, saltByte);

        // step 9 - 10
        for (let i = 0, range = Math.floor(passwordByte.byteLength / digestB.byteLength); i < range; i++) {
            byteListA.push(digestB)
        }
        byteListA.push(digestB.subarray(0, passwordByte.byteLength % digestB.byteLength))

        // step 11
        for (let num = BigInt(passwordByte.byteLength); num !== 0n; num = num >> 1n) {
            byteListA.push(((num & 1n) === 0n) ? passwordByte : digestB);
        }

        // step 12
        return UnixCrypt.generateDigest(config, byteListA);
    }

    private static async generateDigestB(config: UnixCryptConfig, passwordByte: Uint8Array, saltByte: Uint8Array): Promise<Uint8Array> {
        // step 4 - 8
        return UnixCrypt.generateDigest(config, [passwordByte, saltByte, passwordByte]);
    }

    private static async generateDigestDP(config: UnixCryptConfig, passwordByte: Uint8Array): Promise<Uint8Array> {
        // steps 13
        const byteListDP: Uint8Array[] = [];

        // steps 14
        for (let i = 0, range = passwordByte.byteLength; i < range; i++) {
            byteListDP.push(passwordByte);
        }

        // steps 15
        return UnixCrypt.generateDigest(config, byteListDP);
    }

    private static async generateDigestDS(config: UnixCryptConfig, saltByte: Uint8Array, digestA: Uint8Array): Promise<Uint8Array> {
        // step 17
        const byteListDS: Uint8Array[] = [];

        // step 18
        for (let i = 0, range = 16 + digestA[0]; i < range; i++) {
            byteListDS.push(saltByte);
        }

        // step 19
        return UnixCrypt.generateDigest(config, byteListDS);
    }

    private static async generateDigestC(config: UnixCryptConfig, digestA: Uint8Array, byteListP: Uint8Array[], byteListS: Uint8Array[]): Promise<Uint8Array> {
        // step 21
        let digestC = new Uint8Array(digestA);
        for (let i = 0; i < config.rounds; i++) {
            // step 21a
            const byteListC: Uint8Array[] = [];

            // step 21b - 21c
            if (i % 2 !== 0) {
                byteListC.push(...byteListP);
            } else {
                byteListC.push(digestC);
            }

            // step 21d
            if (i % 3 !== 0) {
                byteListC.push(...byteListS);
            }

            // step 21e
            if (i % 7 !== 0) {
                byteListC.push(...byteListP);
            }

            // step 21f - 21g
            if (i % 2 !== 0) {
                byteListC.push(digestC);
            } else {
                byteListC.push(...byteListP);
            }

            // step 21h
            digestC = await UnixCrypt.generateDigest(config, byteListC);
        }

        return digestC;
    }

    private static generateByteListP(config: UnixCryptConfig, passwordByte: Uint8Array, digestDP: Uint8Array): Uint8Array[] {
        // step 16
        const byteListP: Uint8Array[] = [];

        // step 16a
        for (let i = 0, range = Math.floor(passwordByte.byteLength / config.hashType.digestLength); i < range; i++) {
            byteListP.push(digestDP);
        }

        // step 16b
        byteListP.push(digestDP.subarray(0, passwordByte.byteLength % config.hashType.digestLength));

        return byteListP;
    }

    private static generateByteListS(config: UnixCryptConfig, saltByte: Uint8Array, digestDS: Uint8Array): Uint8Array[] {
        // step 20
        const byteListS: Uint8Array[] = [];

        // step 20a
        for (let i = 0, range = Math.floor(saltByte.byteLength / config.hashType.digestLength); i < range; i++) {
            byteListS.push(digestDS);
        }

        // step 20b
        byteListS.push(digestDS.subarray(0, saltByte.byteLength % config.hashType.digestLength))

        return byteListS;
    }

    public static async generateMCF(password: string, config = new UnixCryptConfig): Promise<string> {
        // step 1 - 21
        const digest = await UnixCrypt.getDigest(password, config)

        // step 22
        {
            const mcf: string[] = [""];

            // step 22a
            mcf.push(config.hashType.id);

            // step 22b
            if (config.rounds !== ROUNDS_DEFAULT) {
                mcf.push("rounds=" + config.rounds);
            }

            // step 22c
            mcf.push(config.salt);

            // step 22d

            // step 22e
            {
                let resStr = "";

                const raw = uint8ArrayConcat([digest, new Uint8Array([0])]);
                for (let index of config.hashType.encodeMap) {
                    const MASK = 63n;

                    const byte = (BigInt(raw[index[2]]) << 16n) + (BigInt(raw[index[1]]) << 8n) + (BigInt(raw[index[0]]));

                    resStr += DICTIONARY.charAt(Number(byte & MASK))
                        + DICTIONARY.charAt(Number(byte >> 6n & MASK))
                        + DICTIONARY.charAt(Number(byte >> 12n & MASK))
                        + DICTIONARY.charAt(Number(byte >> 18n & MASK));
                }

                mcf.push(resStr.slice(0, -config.hashType.encodePadding));
            }

            return mcf.join("$");
        }
    }

    public static async getDigest(password: string, config: UnixCryptConfig): Promise<Uint8Array> {
        const encoder = new TextEncoder();

        const passwordByte = encoder.encode(password);
        const saltByte = encoder.encode(config.salt);

        // step 1 - 12
        const digestA = await UnixCrypt.generateDigestA(config, passwordByte, saltByte);

        // steps 13-15
        const digestDP = await UnixCrypt.generateDigestDP(config, passwordByte);

        // step 16
        const byteListP = UnixCrypt.generateByteListP(config, passwordByte, digestDP);

        // step 17 - 19
        const digestDS = await UnixCrypt.generateDigestDS(config, saltByte, digestA);

        // step 20
        const byteListS = UnixCrypt.generateByteListS(config, saltByte, digestDS);

        // step 21
        const digestC = await UnixCrypt.generateDigestC(config, digestA, byteListP, byteListS);

        return digestC;
    }
}
