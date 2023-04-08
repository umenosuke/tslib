import * as UnixCrypt from "./UnixCrypt.js";
import { HASH_TYPE_LIST, type tHashTypeList, HASH_TYPE_DEFAULT, SALT_NOT_ALLOWED_CHAR, ROUNDS_MAX, ROUNDS_MIN, ROUNDS_DEFAULT } from "./UnixCryptConsts.js";

export { test };

async function test(): Promise<string[]> {
    const errors: string[] = [];

    {
        {
            const msgPrefix = "UnixCryptConfig => constructorにパラメーターをセットしないとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => constructorにundefinedをセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsDefault(config)) {
                const msg = msgPrefix + " => 初期値じゃない";
                errors.push(msg);
                console.error(msg, config);
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => constructorにnullをセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({ typeName: undefined, salt: undefined, rounds: undefined });
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsDefault(config)) {
                const msg = msgPrefix + " => 初期値じゃない";
                errors.push(msg);
                console.error(msg, config);
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => constructorに異常値ををセットしたとき";

            const config = new UnixCrypt.UnixCryptConfig({ typeName: <any>"aaa", salt: "@awr43510", rounds: 0 });
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.hashType.name !== HASH_TYPE_DEFAULT) {
                const msg = msgPrefix + " => ハッシュタイプが初期値じゃない";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.hashType.name !== HASH_TYPE_DEFAULT) {
                const msg = msgPrefix + " => ハッシュタイプが初期値じゃない";
                errors.push(msg);
                console.error(msg, config);
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => ハッシュタイプに異常値をセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            const bfHashType = config.hashType.name;

            /*
            config.setHashTypeFromName("");
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.hashType.name !== bfHashType) {
                const msg = msgPrefix + " => ハッシュタイプが変化した";
                errors.push(msg);
                console.error(msg, config);
            }
            */

            config.setHashTypeFromName(<any>"aaa");
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.hashType.name !== bfHashType) {
                const msg = msgPrefix + " => ハッシュタイプが変化した";
                errors.push(msg);
                console.error(msg, config);
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => saltに異常値をセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            const bfSalt = config.salt;

            /*
            config.salt = null;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== bfSalt) {
                const msg = msgPrefix + " => saltが変化した";
                errors.push(msg);
                console.error(msg, config);
            }
            */

            /*
            config.salt = undefined;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== bfSalt) {
                const msg = msgPrefix + " => saltが変化した";
                errors.push(msg);
                console.error(msg, config);
            }
            */

            try {
                config.salt = "@aa";
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.salt !== bfSalt) {
                    const msg = msgPrefix + " => saltが変化した";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }

            try {
                config.salt = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.salt !== "./0123456789ABCD") {
                    const msg = msgPrefix + " => saltが16文字に切り詰められなかった";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }

            try {
                config.salt = "12345678901234567";
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.salt !== "1234567890123456") {
                    const msg = msgPrefix + " => saltが16文字に切り詰められなかった";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => saltに正常値をセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            let bfSalt = config.salt;

            config.salt = UnixCrypt.UnixCryptConfig.getRandomSalt();
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt === bfSalt) {
                const msg = msgPrefix + " => saltが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }

            bfSalt = config.salt;
            config.salt = "./0123456789ABCD";
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt === bfSalt) {
                const msg = msgPrefix + " => saltが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== "./0123456789ABCD") {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }

            bfSalt = config.salt;
            config.salt = "EFGHIJKLMNOPQRST";
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt === bfSalt) {
                const msg = msgPrefix + " => saltが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== "EFGHIJKLMNOPQRST") {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }

            bfSalt = config.salt;
            config.salt = "UVWXYZabcdefghij";
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt === bfSalt) {
                const msg = msgPrefix + " => saltが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== "UVWXYZabcdefghij") {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }

            bfSalt = config.salt;
            config.salt = "klmnopqrstuvwxyz";
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt === bfSalt) {
                const msg = msgPrefix + " => saltが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== "klmnopqrstuvwxyz") {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }

            bfSalt = config.salt;
            config.salt = "aaa";
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt === bfSalt) {
                const msg = msgPrefix + " => saltが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.salt !== "aaa") {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
        }
        {
            const msgPrefix = "UnixCryptConfig => roundsに異常値をセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            const bfRounds = config.rounds;

            /*
            config.rounds = null;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== bfRounds) {
                const msg = msgPrefix + " => roundsが変化した";
                errors.push(msg);
                console.error(msg, config);
            }
            */

            /*
            config.rounds = undefined;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== bfRounds) {
                const msg = msgPrefix + " => roundsが変化した";
                errors.push(msg);
                console.error(msg, config);
            }
            */

            try {
                config.rounds = ROUNDS_MIN - 1;
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.rounds !== ROUNDS_MIN) {
                    const msg = msgPrefix + " => ROUNDS_MINに切り上げられなかった";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }

            try {
                config.rounds = 100;
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.rounds !== ROUNDS_MIN) {
                    const msg = msgPrefix + " => ROUNDS_MINに切り上げられなかった";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }

            try {
                config.rounds = ROUNDS_MAX + 1;
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.rounds !== ROUNDS_MAX) {
                    const msg = msgPrefix + " => ROUNDS_MAXに切り下げられなかった";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }

            try {

                config.rounds = 1234567890;
                if (!unixCryptConfigParamIsNotnull(config)) {
                    const msg = msgPrefix + " => 中身がundefined or nullになっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (!unixCryptConfigParamIsValid(config)) {
                    const msg = msgPrefix + " => 中身が異常値になっている";
                    errors.push(msg);
                    console.error(msg, config);
                } else if (config.rounds !== ROUNDS_MAX) {
                    const msg = msgPrefix + " => ROUNDS_MAXに切り下げられなかった";
                    errors.push(msg);
                    console.error(msg, config);
                }
            } catch (e) {
            }
        }

        {
            const msgPrefix = "UnixCryptConfig => roundsに正常値をセットしたとき";

            const config = UnixCrypt.UnixCryptConfig.from({});
            let bfRounds = config.rounds;

            config.rounds = ROUNDS_MIN;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== ROUNDS_MIN) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = ROUNDS_MIN + 1;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== ROUNDS_MIN + 1) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = ROUNDS_MAX;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== ROUNDS_MAX) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = ROUNDS_MAX - 1;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== ROUNDS_MAX - 1) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = 123456;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== 123456) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = 5000;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== 5000) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = 1000;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== 1000) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;

            config.rounds = 999999999;
            if (!unixCryptConfigParamIsNotnull(config)) {
                const msg = msgPrefix + " => 中身がundefined or nullになっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (!unixCryptConfigParamIsValid(config)) {
                const msg = msgPrefix + " => 中身が異常値になっている";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds === bfRounds) {
                const msg = msgPrefix + " => roundsが変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            } else if (config.rounds !== 999999999) {
                const msg = msgPrefix + " => saltが意図した値に変化しなかった";
                errors.push(msg);
                console.error(msg, config);
            }
            bfRounds = config.rounds;
        }
    }

    {
        {
            const msgPrefix = "UnixCrypt => configが null のとき(デフォルト値)";
            {
                const config = <any>null;
                {
                    const password = "123456789";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
                {
                    const password = "123aa456789";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
                {
                    const password = "あいうえお";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
            }
        }
        {
            const msgPrefix = "UnixCrypt => configが undefined のとき(デフォルト値)";

            {
                const config = <any>undefined;
                {
                    const password = "123456789";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
                {
                    const password = "123aa456789";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
                {
                    const password = "あいうえお";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
            }
        }
        {
            const configParam: { typeName: tHashTypeList, rounds: number } = {
                "typeName": "SHA-512",
                "rounds": 5000
            };
            const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき(saltがランダム)";
            {
                const config = UnixCrypt.UnixCryptConfig.from(configParam);
                {
                    const password = "123456789";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
                {
                    const password = "123aa456789";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
                {
                    const password = "あいうえお";
                    const mcf = await UnixCrypt.UnixCrypt.generateMCF(password);
                    if (mcf == null || mcf.length === 0) {
                        const msg = msgPrefix + " => 生成に失敗した";
                        errors.push(msg);
                        console.error(msg, mcf, password, config);
                    }
                }
            }
        }
        {
            const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                "typeName": "SHA-512",
                "salt": "0N5c0GSPxjMKz3gQ",
                "rounds": 1000
            };
            const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
            {
                const config = new UnixCrypt.UnixCryptConfig(configParam);
                {
                    {
                        const password = "123456789";
                        const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                        if (mcf == null || mcf.length === 0) {
                            const msg = msgPrefix + " => 生成に失敗した";
                            errors.push(msg);
                            console.error(msg, mcf, password, config);
                        } else if (mcf !== "$6$rounds=1000$0N5c0GSPxjMKz3gQ$L8exzJB.ZLPbBxZz.itcgaHwF7G/kl5DfdjTsdqYQD4mxzOLsNq.Ho7dX2vpJvODW6ioG17WiPbLXtJfjiIfE.") {
                            const msg = msgPrefix + " => 意図しない値になった";
                            errors.push(msg);
                            console.error(msg, mcf, password, config);
                        }
                    }
                    {
                        const password = "123aa456789";
                        const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                        if (mcf == null || mcf.length === 0) {
                            const msg = msgPrefix + " => 生成に失敗した";
                            errors.push(msg);
                            console.error(msg, mcf, password, config);
                        } else if (mcf !== "$6$rounds=1000$0N5c0GSPxjMKz3gQ$5X3rqYv6niua2ONkP29Xiw7mCqSp0J9X3VuU9RGbzLUFMxxLr94ZnhQv0SFTCdZU3Cp6p5zirWI9Fo8DA8DrO.") {
                            const msg = msgPrefix + " => 意図しない値になった";
                            errors.push(msg);
                            console.error(msg, mcf, password, config);
                        }
                    }
                    {
                        const password = "あいうえお";
                        const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                        if (mcf == null || mcf.length === 0) {
                            const msg = msgPrefix + " => 生成に失敗した";
                            errors.push(msg);
                            console.error(msg, mcf, password, config);
                        } else if (mcf !== "$6$rounds=1000$0N5c0GSPxjMKz3gQ$4xVExLQXOZGoRZv04zJ44vzGnoxFeY5Rn3Dr5oWJoCgTl5BoFuCZWferhQF/h//VcVmot4Ze5nEkdUNxqUsME0") {
                            const msg = msgPrefix + " => 意図しない値になった";
                            errors.push(msg);
                            console.error(msg, mcf, password, config);
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "0N5c0GSPxjMKz3gQ",
                    "rounds": 5000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$0N5c0GSPxjMKz3gQ$.IrYZQt1mg6D.R/i1Q1DV6NHVRPvCicSDOcfcXk0/IJGdgheDdg8m1K6PD375884FEx/wHPCGxVASFLp7buMQ1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$0N5c0GSPxjMKz3gQ$GpMYGo.LxuOdaTYYhBMohRnBaU.dbvHBJF4MfKwXJT9Iy0YmJNfJWZBFg6lH2t2LuIqYCONFPjx8i6pJOliEs1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$0N5c0GSPxjMKz3gQ$T38N.bkEIFVXW.7vd5rQt3HqSO6eJ2MMupDD/J0lQpbNyvxP7PEuHM5JIZD7E9hRUMT5LDUWxvHpNr6PFlyZO/") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "0N5c0GSPxjMKz3gQ",
                    "rounds": 10000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$0N5c0GSPxjMKz3gQ$I8ItYvjhdAZ0ELL3I9vGlcLYZxT0e5NbBf01lJ59ZEXmFjktiEWlOq9biG6jPbAkegKmo3H8KRBAyldDXxbA41") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$0N5c0GSPxjMKz3gQ$ThKDkDnWWRotR.GIdvwsICuqCxo4A5exrVAx98JcVog/BNJt91PQsS01tz01WdjY/e500Pv0yZiomaGSnFItz1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$0N5c0GSPxjMKz3gQ$EpDZq6QaPy8wt4AODhIBt9iRpf0uV8NlHBMMB04AmcCEHYE64OKun1DRhfGvwWUKL4tkz.1wNzxsnXkqmiwxv1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "",
                    "rounds": 1000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=1000$$G7iUBlVFF2yfok./UEqleh0G2BNnR.usyWftXXQCsO4uhaIip3Bpljs6P.lqEkMAeU/CldqFazUDyG7W6uSRX/") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=1000$$WkU/I8yRF1uCgQRQliXSFGKcW6m2BXX4KbSYzN64kghJKnJL4u4EAj/J6QnX2Yzd8tONV.8xSI13vzBlrKugx/") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=1000$$WACeYc3ust/NQIHhQFQPB9hTM.tyleDItX5P4WCXsPVvw22BGL/cqXxUHi4cTKmCnwgh/ylT3KddRSwqtjW5S0") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "",
                    "rounds": 5000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$$wxKMfpFK8nKly2cSLtTmkU4ZuFfBIBkUbrEPI2BGHE.rIBrbznrZUV9nD/2E77yU7Y3Lzrn3xYRuIQeHhVSE./") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$$3K5YG1FjaRsGjHR2agVnqXyGhDQ4EsQtvLbooa3tL1tm3yElYU1KLrpkCXnMq2w.PvuvzsXwx8VPOg7Q6oFwv0") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$$SZM3PjTxpBcH1SLZDGFbl7J5w7RDNGSlx1uyyMqkZR3gdrOEQRhMuY8cDVYSlfdUzpYqUr446jgKpDSfbhWjA0") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "",
                    "rounds": 10000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$$zgl21aLrE/ufe/dVJSzW3B9VXtVyoXkocJ..wSWX9HiHITQy1jzdmWTaYwc35SFHGTj.y1oBDz3LfgQCtTPCg1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$$2utEP2TxZHIkJo.J9JhFdkbQXEDu.UVB8SJJRk5Ew7Ee.Y8O1qavDH1YksJQXA7KUfDmjdKSiNXunnkT3/LR00") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$$7XnCZPoEQofFBGB7l3vpT4nCgsGv.1usMtbY.f49jhLnqQd2rvQbBjrgvEC2DX/KTtpkto2eciHimn68Kdu1w.") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "a.1a",
                    "rounds": 1000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=1000$a.1a$udsYSkbObW7kXAyvNYDeZA1W2eQ0LIC5O2b7QyvZqnEZXlQGA5zrQM0daAgcQWqBqYzdzr2Sqptdpv.8XVKk2.") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=1000$a.1a$0cmeyYEMXpJmBseNVq.mhg7ZdFf4qg1QpUfYJAmb5o1LGlHC14jA2Lj9oteE1IK6HgduxTWsFPVl073BHAWwH1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=1000$a.1a$l5cUs7453kvazFUzWknFsmlxsPW.c.0mzDNOxUvNtqoujO35tbm71.lisDVbAQJOsxc375gMy5wt5TC5o8lEM.") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "a.1a",
                    "rounds": 5000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$a.1a$Qlgmy6kCdke97Qzyf1dgG9PfTtSSUSNkOu3JVhKgNFJCD5XcOr2Nu82A1QMhZMPw2VEmhgKYjZOHtcG9QaCS40") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$a.1a$VnexJfN99thvAXSzdeYalPNuz75MeXR0LNiHq59NXtyUV386KtQ7RPKkveHtm6FHoFqnLoR8qodhdwRBTT5xU.") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$a.1a$1ho1u.lovp6/8c9pNKFd1lors5TTiU4KE01SpeqH.8.RG1c2JFGVDJVorgBoewWKLe1.dZNJs2iPwW0cKUGqA1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
            {
                const configParam: { typeName: tHashTypeList, salt: string, rounds: number } = {
                    "typeName": "SHA-512",
                    "salt": "a.1a",
                    "rounds": 10000
                };
                const msgPrefix = "UnixCrypt => configが " + JSON.stringify(configParam) + " のとき";
                {
                    const config = new UnixCrypt.UnixCryptConfig(configParam);
                    {
                        {
                            const password = "123456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$a.1a$vq9pw/8Z8yQjIY7KDhqffbGxE7E8/qMHRWn4xmZDiYf8/GL5TVfSEDkPMESQYSMRg8ei6T0b1VEAep7lITsnO1") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "123aa456789";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$a.1a$fGED9z7vs8049YytHY96DOBXFTFJK7h4B/MpOZdE.EeFUUr49HLloiHV60vM8T.ABKpoXylNBZPsdD.OS9R9q/") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                        {
                            const password = "あいうえお";
                            const mcf = await UnixCrypt.UnixCrypt.generateMCF(password, config);
                            if (mcf == null || mcf.length === 0) {
                                const msg = msgPrefix + " => 生成に失敗した";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            } else if (mcf !== "$6$rounds=10000$a.1a$l2gxLBq8pZS67.CK1vYKRJnHgeuVRck7MMeWO2D2tBZYNqlFOzGlppFD44fMHcRT60k/aLZc.zWgSg5FS/hwY0") {
                                const msg = msgPrefix + " => 意図しない値になった";
                                errors.push(msg);
                                console.error(msg, mcf, password, config);
                            }
                        }
                    }
                }
            }
        }
    }

    return errors;
};

function unixCryptConfigParamIsNotnull(config: UnixCrypt.UnixCryptConfig): boolean {
    if (config.hashType == undefined || config.salt == undefined || config.rounds == undefined) {
        return false;
    }

    return true;
}

function unixCryptConfigParamIsValid(config: UnixCrypt.UnixCryptConfig): boolean {
    if (!HASH_TYPE_LIST.includes(config.hashType.name)) {
        return false;
    }

    if (config.rounds < ROUNDS_MIN || config.rounds > ROUNDS_MAX) {
        return false;
    }

    if (config.salt.match(SALT_NOT_ALLOWED_CHAR) || config.salt.length > 16) {
        return false;
    }

    return true;
}

function unixCryptConfigParamIsDefault(config: UnixCrypt.UnixCryptConfig): boolean {
    if (config.hashType.name !== HASH_TYPE_DEFAULT) {
        return false;
    }

    if (config.rounds !== ROUNDS_DEFAULT) {
        return false;
    }

    return true;
}
