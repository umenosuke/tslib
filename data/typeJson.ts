export { type tJson };

type tJsonArray = tJson[];
type tJsonObject = { [key: string]: tJson };
type tJson = string | number | boolean | null | tJsonArray | tJsonObject;
