import { SafeUrl } from "@angular/platform-browser";
import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string | SafeUrl {
        return ThemeProvider.getIconSrc("xsrl");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
