import {GenericILIASObjectPresenter} from "./object-presenter";
import {IconProvider} from "../providers/theme/icon.provider";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return IconProvider.getIconSrc("xsrl");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
