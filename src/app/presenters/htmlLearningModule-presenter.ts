import { SafeUrl } from "@angular/platform-browser";
import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class HtmlLearningModuleObjectPresenter extends GenericILIASObjectPresenter {

    showTypeAsText(): boolean {
        return false;
    }
}
