/** presenters */
import {ILIASObjectPresenter, GenericILIASObjectPresenter} from "./object-presenter";
import {CourseObjectPresenter} from "./course-presenter";
import {FolderObjectPresenter} from "./folder-presenter";
import {GroupObjectPresenter} from "./group-presenter";
import {FileObjectPresenter} from "./file-presenter";
import {LearnplaceObjectPresenter} from "./learnplace-presenter";
/** misc */
import {ILIASObject} from "../models/ilias-object";
import {HtmlLearningModuleObjectPresenter} from "./htmlLearningModule-presenter";

export class ILIASObjectPresenterFactory {
    static instance(object: ILIASObject): ILIASObjectPresenter {
        if (object.type == "crs") return new CourseObjectPresenter(object);
        if (object.type == "fold") return new FolderObjectPresenter(object);
        if (object.type == "grp") return new GroupObjectPresenter(object);
        //MARK: COMMENTED HTML LEARNING MODULE OUT
        // if (object.type == "htlm") return new HtmlLearningModuleObjectPresenter(object);
        if (object.type == "file") return new FileObjectPresenter(object);
        if (object.isLearnplace()) return new LearnplaceObjectPresenter(object);


        return new GenericILIASObjectPresenter(object);
    }
}
