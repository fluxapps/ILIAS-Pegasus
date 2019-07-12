/**
 * Holds the the styling information, if an ILIAS object has a page layout.
 */
var PageLayout = /** @class */ (function () {
    function PageLayout(type) {
        if (type === void 0) { type = ""; }
        this.icon = "assets/icon/info.svg";
        switch (type) {
            case "crs":
                this.text = "page-layout.course";
                break;
            case "grp":
                this.text = "page-layout.group";
                break;
            case "fold":
                this.text = "page-layout.folder";
                break;
            default:
                this.text = "page-layout.default";
                break;
        }
    }
    return PageLayout;
}());
export { PageLayout };
//# sourceMappingURL=page-layout.js.map