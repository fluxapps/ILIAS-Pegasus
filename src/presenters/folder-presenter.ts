import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme";

export class FolderObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.instance().getAsset("icon/obj_folder.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
