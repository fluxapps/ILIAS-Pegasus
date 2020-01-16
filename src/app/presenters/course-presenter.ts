import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.getIconSrc("crs");
        //return "assets/icon/obj_course.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
