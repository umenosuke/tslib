export { type tAddressFamily, addressFamilyList, type tParseMode, parseModeList, type tStringifyMode, stringifyModeList };

const addressFamilyList = [
    "unknown",
    "v4",
    "v6",
] as const;
type tAddressFamily = typeof addressFamilyList[number];

const parseModeList = [
    "auto",
    "host",
    "subnetMask",
    "wildcardBit",
    "prefix",
] as const;
type tParseMode = typeof parseModeList[number];

const stringifyModeList = [
    "subnetMask",
    "wildcardBit",
    "prefix",
] as const;
type tStringifyMode = typeof stringifyModeList[number];
