import { arrayBuffer2Hexstring } from "../data/arrayBuffer2Hexstring.js";

export { sha256sum };

async function sha256sum(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const textByte = encoder.encode(text);

    const hashByte = await crypto.subtle.digest("SHA-256", textByte);

    return arrayBuffer2Hexstring(hashByte);
}
