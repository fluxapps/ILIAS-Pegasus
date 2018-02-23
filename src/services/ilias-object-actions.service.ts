import {Inject, Injectable} from "@angular/core";
import {NavController, ModalController} from "ionic-angular";
import {Builder} from "./builder.base";
import {LINK_BUILDER, LinkBuilder} from "./link/link-builder.service";
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
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../actions/open-object-in-ilias-action";
import {TranslateService} from "ng2-translate/ng2-translate";
import {DataProvider} from "../providers/data-provider.provider";
import {TokenUrlConverter} from "./url-converter.service";
import {InAppBrowser} from "@ionic-native/in-app-browser";

@Injectable()
export class ILIASObjectActionsService {

    static get CONTEXT_ACTION_MENU(): string {
        return "actionMenu";
    }

    static get CONTEXT_DETAILS_PAGE(): string {
        return "detailsPage";
    }

    constructor( protected nav: NavController,
                        protected sync: SynchronizationService,
                        protected file: FileService,
                        protected translate: TranslateService,
                        protected modal: ModalController,
                        protected dataProvider: DataProvider,
                        private readonly urlConverter: TokenUrlConverter,
                        private readonly browser: InAppBrowser,
                        @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                        private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                        @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
    ) {
    }

    getActions(iliasObject: ILIASObject, context: string): Array<ILIASObjectAction> {
        if (context == ILIASObjectActionsService.CONTEXT_ACTION_MENU) {
            return this.getActionsForActionMenu(iliasObject);
        }
        if (context == ILIASObjectActionsService.CONTEXT_DETAILS_PAGE) {
            return this.getActionsForDetailsPage(iliasObject);
        }
    }


    getPrimaryAction(iliasObject: ILIASObject): ILIASObjectAction {
        if (iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.view_in_ilias"), iliasObject, this.nav);
        }
        if (iliasObject.type == "file") {
            return new OpenFileExternalAction(this.translate.instant("actions.open_in_external_app"), iliasObject, this.file);
        }

      return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
    }

    /**
     *
     * @param iliasObject
     * @returns {Array}
     */
    protected getActionsForDetailsPage(iliasObject: ILIASObject): Array<ILIASObjectAction> {
        const actions: Array<ILIASObjectAction> = [
          this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId))
        ];
        if (!iliasObject.isFavorite) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject));
        } else if (iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.unmark_as_favorite"), iliasObject));
        }
        if (iliasObject.isContainer()) {
            if (!iliasObject.isOfflineAvailable) {
                actions.push(new MarkAsOfflineAvailableAction(
                  this.translate.instant("actions.mark_as_offline_available"),
                  iliasObject,
                  this.dataProvider,
                  this.sync,
                  this.modal)
                );
            } else if (iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"),iliasObject));
                actions.push(new SynchronizeAction(
                  this.translate.instant("actions.synchronize"),
                  iliasObject,
                  this.sync,
                  this.modal,
                  this.translate)
                );
            }
        }

        return actions;
    }


    /**
     * Return available actions for the action menu of the given object
     * @param iliasObject
     * @returns {ILIASObjectAction[]}
     */
    protected getActionsForActionMenu(iliasObject: ILIASObject): Array<ILIASObjectAction> {
        const actions: Array<ILIASObjectAction> = [
            new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.nav),
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId)),
        ];
        if (!iliasObject.isFavorite) {
            actions.push(new MarkAsFavoriteAction(this.translate.instant("actions.mark_as_favorite"), iliasObject));
        } else if (iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(this.translate.instant("actions.umark_as_favorite"), iliasObject));
        }
        if (iliasObject.isContainer()) {
            if (!iliasObject.isOfflineAvailable) {
                actions.push(new MarkAsOfflineAvailableAction(
                  this.translate.instant("actions.mark_as_offline_available"),
                  iliasObject,
                  this.dataProvider,
                  this.sync,
                  this.modal)
                );
            } else if (iliasObject.isOfflineAvailable && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM) {
                actions.push(new UnMarkAsOfflineAvailableAction(this.translate.instant("actions.unmark_as_offline_available"), iliasObject));
                actions.push(new SynchronizeAction(
                  this.translate.instant("actions.synchronize"),
                  iliasObject,
                  this.sync,
                  this.modal,
                  this.translate
                ));
            }
        }
        return actions;
    }

}
