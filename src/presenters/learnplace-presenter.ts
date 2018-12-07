import {GenericILIASObjectPresenter} from "./object-presenter";
import {BrandingProvider} from "../providers/branding";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return BrandingProvider.instance().getAsset("icon/icon_xsrl.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
