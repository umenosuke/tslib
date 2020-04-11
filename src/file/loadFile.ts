export { loadFile };

async function loadFile(file: File): Promise<ArrayBuffer> {
    return await file.arrayBuffer();
}
