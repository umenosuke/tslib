export { eParseMode, eStringifyMode };

enum eParseMode {
    auto = "auto",
    host = "host",
    subnetMask = "subnetMask",
    wildcardBit = "wildcardBit",
    prefix = "prefix",
    empty = "empty"
};

enum eStringifyMode {
    subnetMask = "subnetMask",
    wildcardBit = "wildcardBit",
    prefix = "prefix"
};