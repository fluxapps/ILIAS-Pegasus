import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.instance().getAsset("icon/obj_group.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
