import {GenericILIASObjectPresenter} from "./object-presenter";
import {ThemeProvider} from "../providers/theme/theme.provider";

export class HtmlLearningModuleObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return ThemeProvider.getIconSrc("htlm");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
