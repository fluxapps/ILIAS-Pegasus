/**
 * Contains the data to display a timeline.
 */
var TimeLine = /** @class */ (function () {
    /**
     * Sets the text as language variable depending on the given {@code type}.
     * If the type can not be identified a default text will be set.
     *
     *
     * @param {string} type an ILIAS object type
     */
    function TimeLine(type) {
        if (type === void 0) { type = ""; }
        this.icon = "pulse";
        switch (type) {
            case "crs":
                this.text = "timeline.course";
                break;
            case "grp":
                this.text = "timeline.group";
                break;
            default:
                this.text = "timeline.default";
                break;
        }
    }
    return TimeLine;
}());
export { TimeLine };
//# sourceMappingURL=timeline.js.map