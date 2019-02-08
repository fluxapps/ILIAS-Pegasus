import {GenericILIASObjectPresenter} from "./object-presenter";

export class FolderObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "assets/icon/obj_folder.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
