import {GenericILIASObjectPresenter} from "./object-presenter";
import {BrandingProvider} from "../providers/branding";

export class LearnplaceObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return BrandingProvider.instance().getAsset("icon/obj_location.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
