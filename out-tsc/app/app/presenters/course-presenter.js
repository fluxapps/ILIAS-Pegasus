var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { GenericILIASObjectPresenter } from "./object-presenter";
var CourseObjectPresenter = /** @class */ (function (_super) {
    __extends(CourseObjectPresenter, _super);
    function CourseObjectPresenter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CourseObjectPresenter.prototype.icon = function () {
        return "assets/icon/obj_course.svg";
    };
    CourseObjectPresenter.prototype.showTypeAsText = function () {
        return false;
    };
    return CourseObjectPresenter;
}(GenericILIASObjectPresenter));
export { CourseObjectPresenter };
//# sourceMappingURL=course-presenter.js.map