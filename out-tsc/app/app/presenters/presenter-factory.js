/** presenters */
import { GenericILIASObjectPresenter } from "./object-presenter";
import { CourseObjectPresenter } from "./course-presenter";
import { FolderObjectPresenter } from "./folder-presenter";
import { GroupObjectPresenter } from "./group-presenter";
import { FileObjectPresenter } from "./file-presenter";
import { LearnplaceObjectPresenter } from "./learnplace-presenter";
var ILIASObjectPresenterFactory = /** @class */ (function () {
    function ILIASObjectPresenterFactory() {
    }
    ILIASObjectPresenterFactory.instance = function (object) {
        if (object.type == "crs")
            return new CourseObjectPresenter(object);
        if (object.type == "fold")
            return new FolderObjectPresenter(object);
        if (object.type == "grp")
            return new GroupObjectPresenter(object);
        if (object.type == "file")
            return new FileObjectPresenter(object);
        if (object.isLearnplace())
            return new LearnplaceObjectPresenter(object);
        return new GenericILIASObjectPresenter(object);
    };
    return ILIASObjectPresenterFactory;
}());
export { ILIASObjectPresenterFactory };
//# sourceMappingURL=presenter-factory.js.map