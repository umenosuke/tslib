export { csv2json };

function csv2json(csv: string, keyColumIndex: number = -1, separator: string | RegExp = ","): {
    header: string[],
    items: {
        key: string,
        data: { [name: string]: string }
    }[]
} {
    csv = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const csvRows = csv.split("\n");
    const fieldNames = csvRows[0]!.split(separator);

    if (fieldNames.length <= keyColumIndex) {
        console.error("key colum index out of range");
        keyColumIndex = -1;
    }

    const items: {
        key: string,
        data: { [name: string]: string }
    }[] = [];

    for (let i = 1; i < csvRows.length; i++) {
        if (csvRows[i] === "") { continue; }
        const csvCols = csvRows[i]!.split(separator);

        const data: { [name: string]: string } = {};
        for (let j = 0; j < fieldNames.length && j < csvCols.length; j++) {
            if (csvCols[j] !== "") {
                data[fieldNames[j]!] = csvCols[j]!;
            }
        }
        let key = (keyColumIndex < 0) ? "" + i : (csvCols[keyColumIndex] ?? "");

        items.push({ key: key, data: data });
    }

    return { header: fieldNames, items: items };
}
