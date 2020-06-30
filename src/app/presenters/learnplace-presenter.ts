import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.getIconSrc("xsrl");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
