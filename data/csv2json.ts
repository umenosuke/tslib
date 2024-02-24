export { csv2json };

function csv2json(csv: string, {
    keyColumIndex = -1,
    separator = ",",
    emptyColumIsUndefined = true,
    skipEmptyRow = true,
    columTrim = false,
}: {
    keyColumIndex?: number,
    separator?: string | RegExp,
    emptyColumIsUndefined?: boolean,
    skipEmptyRow?: boolean,
    columTrim?: boolean,
} = {}): {
    header: string[],
    items: {
        key: string,
        data: { [name: string]: string }
    }[]
} {
    csv = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const csvRows = csv.split("\n");
    const firstRow = csvRows[0];
    if (firstRow == undefined) {
        throw new Error("firstRow == undefined");
    }
    const fieldNames = firstRow.split(separator);

    if (fieldNames.length <= keyColumIndex) {
        console.error("key colum index out of range");
        keyColumIndex = -1;
    }

    const items: {
        key: string,
        data: { [name: string]: string }
    }[] = [];

    for (let rowIndex = 1; rowIndex < csvRows.length; rowIndex++) {
        const row = csvRows[rowIndex];
        if (row == undefined) {
            throw new Error("row == undefined");
        }
        if (skipEmptyRow && row === "") { continue; }
        const csvCols = row.split(separator);

        const data: { [name: string]: string } = {};
        for (let colIndex = 0; colIndex < fieldNames.length; colIndex++) {
            const fieldName = fieldNames[colIndex];
            if (fieldName == undefined) {
                throw new Error("fieldName == undefined");
            }

            const col = csvCols[colIndex];
            if (col == undefined) {
                if (!emptyColumIsUndefined) {
                    data[fieldName] = "";
                }
                continue;
            }

            if (!emptyColumIsUndefined || col !== "") {
                if (columTrim) {
                    data[fieldName] = col.trim();
                } else {
                    data[fieldName] = col;
                }
            }
        }
        let key = (keyColumIndex < 0) ? "" + rowIndex : (csvCols[keyColumIndex] ?? "");

        items.push({ key: key, data: data });
    }

    return { header: fieldNames, items: items };
}
