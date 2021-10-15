import { blob2URI, revokeURI } from "./blob2URI.js";

export { saveFile };

async function saveFile(fileName: string, data: string | Blob |
    ArrayBuffer): Promise<void> {
    const url = await blob2URI(new Blob([data]));
    const a = document.createElement("a");
    a.style.display = "none";
    a.target = "_brank";

    a.href = url;
    a.setAttribute("download", fileName);

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    revokeURI(url);
}
