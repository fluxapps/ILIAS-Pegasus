import {GenericILIASObjectPresenter} from "./object-presenter";
import {BrandingProvider} from "../providers/branding";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon(): string {
        return BrandingProvider.instance().getAsset("icon/obj_group.svg");
    }

    showTypeAsText(): boolean {
        return false;
    }
}
