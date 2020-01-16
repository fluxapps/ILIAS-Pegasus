import {GenericILIASObjectPresenter} from "./object-presenter";
import {IconProvider} from "../providers/theme/icon.provider";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return IconProvider.getIconSrc("crs");
        //return "assets/icon/obj_course.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
