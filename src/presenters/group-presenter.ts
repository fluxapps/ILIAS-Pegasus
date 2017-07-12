import {GenericILIASObjectPresenter} from "./object-presenter";

export class GroupObjectPresenter extends GenericILIASObjectPresenter {

    icon():string {
        return 'people';
    }

    showTypeAsText():boolean {
        return false;
    }
}