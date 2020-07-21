import { SafeUrl } from "@angular/platform-browser";
import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class SahsLearningModuleObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string | SafeUrl {
        return ThemeProvider.getIconSrc("sahs");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
