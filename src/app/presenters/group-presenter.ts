import {GenericILIASObjectPresenter} from "./object-presenter";
import {IconProvider} from "../providers/theme/icon.provider";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return IconProvider.getIconSrc("grp");
        //return "assets/icon/obj_group.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
