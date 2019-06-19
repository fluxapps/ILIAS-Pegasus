import {GenericILIASObjectPresenter} from "./object-presenter";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "assets/icon/obj_course.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
