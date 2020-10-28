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
import {SahsLearningModuleObjectPresenter} from "./sahsLearningModule-presenter";
import { ThemeProvider } from "../providers/theme/theme.provider";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class ILIASObjectPresenterFactory {

    constructor(private readonly themeProvider: ThemeProvider) {}

    instance(object: ILIASObject): ILIASObjectPresenter {
        if (object.type == "crs") return new CourseObjectPresenter(object, this.themeProvider);
        if (object.type == "fold") return new FolderObjectPresenter(object, this.themeProvider);
        if (object.type == "grp") return new GroupObjectPresenter(object, this.themeProvider);
        if (object.type == "htlm") return new HtmlLearningModuleObjectPresenter(object, this.themeProvider);
        if (object.type == "sahs") return new SahsLearningModuleObjectPresenter(object, this.themeProvider);
        if (object.type == "file") return new FileObjectPresenter(object, this.themeProvider);
        if (object.isLearnplace()) return new LearnplaceObjectPresenter(object, this.themeProvider);


        return new GenericILIASObjectPresenter(object, this.themeProvider);
    }
}
