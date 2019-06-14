import {GenericILIASObjectPresenter} from "./object-presenter";

export class HtmlLearningModuleObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return "assets/icon/obj_htlm.svg";
    }

    showTypeAsText(): boolean {
        return false;
    }
}
