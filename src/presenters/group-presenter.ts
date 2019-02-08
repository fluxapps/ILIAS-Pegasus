import {GenericILIASObjectPresenter} from "./object-presenter";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "assets/icon/obj_group.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
