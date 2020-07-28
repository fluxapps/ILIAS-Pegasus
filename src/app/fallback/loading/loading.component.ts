import { Component } from "@angular/core";
import { LoadingService } from "./loading.service";

export enum LoadingPageType {
    generic,
    learnplace,
    learningmodule,
}

@Component({
    templateUrl: "loading.html"
})
export class LoadingPage {
    // the type of object that is being loaded
    static type: LoadingPageType = LoadingPageType.generic;

    constructor(
        readonly loadingService: LoadingService,
    ) {
    }

    translateKeyForType(key: string): string {
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
