export { eAddressFamily, eParseMode, eStringifyMode };

enum eAddressFamily {
    unknown = "unknown",
    v4 = "v4",
    v6 = "v6",
};

enum eParseMode {
    auto = "auto",
    host = "host",
    subnetMask = "subnetMask",
    wildcardBit = "wildcardBit",
    prefix = "prefix"
};

enum eStringifyMode {
    subnetMask = "subnetMask",
    wildcardBit = "wildcardBit",
    prefix = "prefix"
};