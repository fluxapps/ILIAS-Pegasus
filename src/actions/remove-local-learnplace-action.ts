/** angular */
import {InjectionToken} from "@angular/core";
/** misc */
import {IOError} from "../error/errors";
import {LearnplaceManager} from "../learnplace/services/learnplace.management";
import {ILIASObjectAction, ILIASObjectActionAlert, ILIASObjectActionError, ILIASObjectActionResult, ILIASObjectActionSuccess} from "./object-action";
import {TranslateService} from "@ngx-translate/core";

export class RemoveLocalLearnplaceAction extends ILIASObjectAction {

    constructor(
        private readonly learnplaceManager: LearnplaceManager,
        private readonly translation: TranslateService,
        public title: string,
        private readonly objectId: number,
        private readonly userId: number) {
        super();
    }

    async execute(): Promise<ILIASObjectActionResult> {
        try {
            await this.learnplaceManager.remove(this.objectId, this.userId);
            return new ILIASObjectActionSuccess(this.translation.instant("actions.removed_local_learnplace"));
        }
        catch (error) {
            if(error instanceof IOError)
                return new ILIASObjectActionError(this.translation.instant("actions.removed_local_learnplace_failed"));

            throw error;
        }
    }

    alert(): ILIASObjectActionAlert {
        return null;
    }
}

export interface RemoveLocalLearnplaceActionFunction {(title: string, objectId: number, userId: number): RemoveLocalLearnplaceAction }
export const REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION: InjectionToken<RemoveLocalLearnplaceAction> =
    new InjectionToken("token for remove local learnplace action factory");
