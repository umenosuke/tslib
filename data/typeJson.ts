export { type tJson };

type tJsonPrimitive = string | number | boolean | null;
type tJsonArray = (tJsonPrimitive | tJsonObject)[];
type tJsonObject = { [key: string]: tJsonPrimitive | tJsonArray | tJsonObject };
type tJson = tJsonArray | tJsonObject;
