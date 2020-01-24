import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.getIconSrc("grp");
        //return "assets/icon/obj_group.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
