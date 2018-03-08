import {GenericILIASObjectPresenter} from "./object-presenter";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "./assets/icon/icon_grp.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
