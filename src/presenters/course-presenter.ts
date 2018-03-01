import {GenericILIASObjectPresenter} from "./object-presenter";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "./assets/icon/icon_crs.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
