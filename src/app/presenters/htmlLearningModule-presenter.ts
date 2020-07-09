import { SafeUrl } from "@angular/platform-browser";
import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class HtmlLearningModuleObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string | SafeUrl {
        return ThemeProvider.getIconSrc("htlm");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
