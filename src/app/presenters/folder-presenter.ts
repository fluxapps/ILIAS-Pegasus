import {GenericILIASObjectPresenter} from "./object-presenter";
import {IconProvider} from "../providers/theme/icon.provider";

export class FolderObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return IconProvider.getIconSrc("fold");
        //return "assets/icon/obj_folder.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
