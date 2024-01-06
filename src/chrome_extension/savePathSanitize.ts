export { savePathSanitize };

function savePathSanitize(str: string): string {
    return str
        .replace(/\u200D/g, "_u200D_")
        .replace(/\u200E/g, "_u200E_")
        .replace(/\uFE0F/g, "_uFE0F_")
        .replace(/!/g, "！")
        .replace(/\?/g, "？")
        .replace(/&/g, "＆")
        .replace(/\*/g, "＊")
        .replace(/\\/g, "￥")
        .replace(/~/g, "～")
        .replace(/:/g, "：")
        .replace(/\(/g, "（")
        .replace(/\)/g, "）")
        .replace(/\</g, "＜")
        .replace(/\>/g, "＞")
        .replace(/\|/g, "｜")
        .replace(/"/g, "”")
        .replace(/'/g, "’")
        .replace(/\./g, "．")
        .replace(/．([^．]+$)/, ".$1");
}
