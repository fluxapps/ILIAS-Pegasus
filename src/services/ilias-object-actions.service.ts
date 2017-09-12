import {Injectable} from '@angular/core';
import {NavController} from "ionic-angular";
import {SynchronizationService} from "./synchronization.service";
import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction} from "../actions/object-action";
import {ShowDetailsPageAction} from "../actions/show-details-page-action";
import {MarkAsFavoriteAction} from "../actions/mark-as-favorite-action";
import {UnMarkAsFavoriteAction} from "../actions/unmark-as-favorite-action";
import {MarkAsOfflineAvailableAction} from "../actions/mark-as-offline-available-action";
import {UnMarkAsOfflineAvailableAction} from "../actions/unmark-as-offline-available-action";
import {SynchronizeAction} from "../actions/synchronize-action";
import {ShowObjectListPageAction} from "../actions/show-object-list-page-action";
import {OpenFileExternalAction} from "../actions/open-file-external-action";
import {FileService} from "./file.service";
import {OpenObjectInILIASAction} from "../actions/open-object-in-ilias-action";
import {TranslateService} from "ng2-translate/ng2-translate";
import {ModalController} from "ionic-angular/index";
import {DataProvider} from "../providers/data-provider.provider";
import {ILIASLink, TokenLinkRewriter} from "./link-rewriter.service";

@Injectable()
export class ILIASObjectActionsService {

    public static get CONTEXT_ACTION_MENU():string {
        return 'actionMenu';
    }

    public static get CONTEXT_DETAILS_PAGE():string {
        return 'detailsPage';
    }

    public constructor( protected nav:NavController,
                        protected sync:SynchronizationService,
                        protected file:FileService,
                        protected translate:TranslateService,
                        protected modal:ModalController,
                        protected dataProvider:DataProvider,
                        private readonly linkRewriter: TokenLinkRewriter
    ) {
    }

    public getActions(iliasObject:ILIASObject, context:string):ILIASObjectAction[] {
        if (context == ILIASObjectActionsService.CONTEXT_ACTION_MENU) {
            return this.getActionsForActionMenu(iliasObject);
        }
        if (context == ILIASObjectActionsService.CONTEXT_DETAILS_PAGE) {
            return this.getActionsForDetailsPage(iliasObject);
        }
    }


    public getPrimaryAction(iliasObject:ILIASObject):ILIASObjectAction {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.view_in_ilias"), iliasObject, this.nav);
        }
        if (iliasObject.type == 'file') {
            return new OpenFileExternalAction(this.translate.instant("actions.open_in_external_app"), iliasObject, this.file);
        }

        return new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), new ILIASLink(iliasObject.link), this.linkRewriter);
    }

    /**
     *
     * @param iliasObject
     * @returns {Array}
     */
    protected getActionsForDetailsPage(iliasObject:ILIASObject):ILIASObjectAction[] {
        let actions:ILIASObjectAction[] = [new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), new ILIASLink(iliasObject.link), this.linkRewriter)];
        if (!iliasObject.isFavorite) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject));
        } else if (iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject));
        }
        if (iliasObject.isContainer()) {
            if (!iliasObject.isOfflineAvailable) {
                actions.push(new MarkAsOfflineAvailableAction(this.translate.instant("actions.mark_as_offline_available"), iliasObject, this.dataProvider, this.sync, this.modal));
            } else if (iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"),iliasObject));
                actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
            }
        }

        return actions;
    }


    /**
     * Return available actions for the action menu of the given object
     * @param iliasObject
     * @returns {ILIASObjectAction[]}
     */
    protected getActionsForActionMenu(iliasObject:ILIASObject):ILIASObjectAction[] {
        let actions:ILIASObjectAction[] = [
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav),
            new OpenObjectInILIASAction(this.translate.instant("actions.view_in_ilias"), new ILIASLink(iliasObject.link), this.linkRewriter),
        ];
        if (!iliasObject.isFavorite) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject));
        } else if (iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.umark_as_favorite"), iliasObject));
        }
        if (iliasObject.isContainer()) {
            if (!iliasObject.isOfflineAvailable) {
                actions.push(new MarkAsOfflineAvailableAction(this.translate.instant("actions.mark_as_offline_available"), iliasObject, this.dataProvider, this.sync, this.modal));
            } else if (iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"), iliasObject));
                actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
            }
        }
        return actions;
    }

}
