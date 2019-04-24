import {GenericILIASObjectPresenter} from "./object-presenter";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "assets/icon/obj_location.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
