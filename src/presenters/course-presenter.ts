import {GenericILIASObjectPresenter} from "./object-presenter";
import {BrandingProvider} from "../providers/branding";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return BrandingProvider.instance().getAsset("icon/obj_course.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
