import {GenericILIASObjectPresenter} from "./object-presenter";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "./assets/icon/icon_xsrl.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
