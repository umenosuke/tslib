export { propertySort };

function propertySort(inObj: any): any {
    if (Array.isArray(inObj)) {
        const outArray: any[] = [];

        inObj.forEach((val) => {
            outArray.push(propertySort(val));
        });

        return outArray;
    }

    switch (typeof (inObj)) {
        case "object":
            const outObj: { [key: string]: number | string } = {};

            const keys = Object.keys(inObj);
            keys.sort();
            keys.forEach((key) => {
                outObj[key] = propertySort(inObj[key]);
            });

            return outObj;
        default:
            return inObj;
    }
}
