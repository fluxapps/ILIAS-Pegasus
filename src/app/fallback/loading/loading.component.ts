import {Component} from "@angular/core";
import {FooterToolbarService} from "../../services/footer-toolbar.service";
import {Subject} from "rxjs";

export enum LoadingPageType {
    generic,
    learnplace,
    learningmodule,
}

@Component({
    templateUrl: "loading.html"
})
export class LoadingPage {
    // subject where processes can post their progress
    static progress: Subject<number>;
    // the type of object that is being loaded
    static type: LoadingPageType = LoadingPageType.generic;

    private progress: number = 0;
    constructor(
        readonly footerToolbar: FooterToolbarService,
    ) {
        if(!LoadingPage.progress) LoadingPage.progress = new Subject<number>();
        LoadingPage.progress.subscribe((progress: number) => this.progress = progress);
    }

    private translateKeyForType(key: string): string {
        switch (LoadingPage.type) {
            case LoadingPageType.generic:
                return `fallback.generic.${key}`;
            case LoadingPageType.learnplace:
                return `fallback.learnplace.${key}`;
            case LoadingPageType.learningmodule:
                return `fallback.learningmodule.${key}`;
        }
        return key;
    }

}
