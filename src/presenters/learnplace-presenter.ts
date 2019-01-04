import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.instance().getAsset("icon/obj_location.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
