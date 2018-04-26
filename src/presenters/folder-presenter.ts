import {GenericILIASObjectPresenter} from "./object-presenter";

export class FolderObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "./assets/icon/icon_fold.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
