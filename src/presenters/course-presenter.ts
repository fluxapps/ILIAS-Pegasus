import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.instance().getAsset("icon/obj_course.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
