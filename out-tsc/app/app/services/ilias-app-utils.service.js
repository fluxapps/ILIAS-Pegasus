var ILIASAppUtils = /** @class */ (function () {
    function ILIASAppUtils() {
    }
    ILIASAppUtils.formatSize = function (bytes, decimals) {
        if (decimals === void 0) { decimals = 2; }
        if (!bytes)
            return "0 KB";
        var k = 1000; // or 1024 for binary
        var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
    };
    return ILIASAppUtils;
}());
export { ILIASAppUtils };
//# sourceMappingURL=ilias-app-utils.service.js.map