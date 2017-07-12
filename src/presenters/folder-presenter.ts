import {GenericILIASObjectPresenter} from "./object-presenter";

export class FolderObjectPresenter extends GenericILIASObjectPresenter {
    
    icon():string {
        return 'folder';
    }

    showTypeAsText():boolean {
        return false;
    }
}