import {Injectable, InjectionToken} from "@angular/core";

export interface LearningModuleLoader {
    /**
     * Loads all relevant data of the learnplace matching
     * the given {@code objectId} and stores them.
     */
    load(objectId: number): Promise<void>
}

export const LEARNING_MODULE_LOADER: InjectionToken<LearningModuleLoader> = new InjectionToken("token for learning module loader");

@Injectable({
    providedIn: "root"
})
export class RestLearningModuleLoader implements LearningModuleLoader {
    load(objectId: number): Promise<void> {
        // TODO dev
        return;
    }
}
