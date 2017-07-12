import {GenericILIASObjectPresenter} from "./object-presenter";

export class CourseObjectPresenter extends GenericILIASObjectPresenter {

    icon():string {
        return 'easel';
    }

    showTypeAsText():boolean {
        return false;
    }
}