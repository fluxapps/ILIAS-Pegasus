/** angular */
import {Component, Inject, NgZone} from "@angular/core";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {
    ActionSheetController,
    AlertController,
    ModalController,
    NavController,
    ToastController
} from "@ionic/angular";
/** ionic-native */
import {InAppBrowser} from "@ionic-native/in-app-browser/ngx";
/** services */
import {Builder} from "../../services/builder.base";
import {FileService} from "../../services/file.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {SynchronizationService} from "../../services/synchronization.service";
/** models */
import {DesktopItem} from "../../models/desktop-item";
import {ILIASObject} from "../../models/ilias-object";
import {PageLayout} from "../../models/page-layout";
import {TimeLine} from "../../models/timeline";
import {User} from "../../models/user";
import {Favorites} from "../../models/favorites";
/** actions */
import {DownloadAndOpenFileExternalAction} from "../../actions/download-and-open-file-external-action";
import {MarkAsFavoriteAction} from "../../actions/mark-as-favorite-action";
import {ILIASObjectAction, ILIASObjectActionResult, ILIASObjectActionSuccess} from "../../actions/object-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {RemoveLocalFileAction} from "../../actions/remove-local-file-action";
import {RemoveLocalFilesAction} from "../../actions/remove-local-files-action";
import {ShowDetailsPageAction} from "../../actions/show-details-page-action";
import {ShowObjectListPageAction} from "../../actions/show-object-list-page-action";
import {SynchronizeAction} from "../../actions/synchronize-action";
import {UnMarkAsFavoriteAction} from "../../actions/unmark-as-favorite-action";
//TODO lp import {OPEN_LEARNPLACE_ACTION_FACTORY, OpenLearnplaceActionFunction} from "../../actions/open-learnplace-action";
//TODO lp import {REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION, RemoveLocalLearnplaceActionFunction} from "../../actions/remove-local-learnplace-action";
/** logging */
import {Log} from "../../services/log.service";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {Exception} from "../../exceptions/Exception";
import {DataProvider} from "../../providers/data-provider.provider";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {TimelineLinkBuilder} from "../../services/link/timeline.builder";
import {DefaultLinkBuilder} from "../../services/link/default.builder";
import {
    trigger,
    state,
    style,
    animate,
    transition
  } from '@angular/animations';

// used for navigation from one container into another one
interface NavigationState {
    favorites: boolean,
    depth: number,
    child: ILIASObject,
    details: ILIASObject
}

// summarizes the state of the currently displayed object-list-page
interface PageState {
    favorites: boolean,
    online: boolean,
    loadingLive: boolean,
    loadingOffline: boolean,
    refreshing: boolean,
    desktop: boolean,
}

@Component({
    selector: "page-object-list",
    templateUrl: "object-list.html",
    animations: [
        trigger('fadein', [
          state('void', style({ opacity: 0 })),
          transition('void => *', [
            style({ opacity: 0 }),
            animate('900ms ease-out', style({ opacity: 1 }))
          ])
        ]),
        trigger('slidelefttitle', [
          transition('void => *', [
            style({ opacity: 0, transform: 'translateX(150%)' }),
            animate('900ms 300ms ease-out', style({ transform: 'translateX(0%)', opacity: 1 }, ))
          ])
        ])
      ]
})
export class ObjectListPage {
    private static nav: NavigationState = {
        favorites: undefined,
        depth: undefined,
        child: undefined,
        details: undefined
    };

    state: PageState = {
        favorites: undefined,
        online: undefined,
        loadingLive: false,
        loadingOffline: false,
        refreshing: false,
        desktop: undefined
    };

    private pageTitle: string;
    private parent: ILIASObject;
    private content: Array<ILIASObject> = [];

    private pageLayout: PageLayout;
    private timeline: TimeLine;
    private readonly log: Logger = Logging.getLogger(ObjectListPage.name);

    constructor(private readonly navCtrl: NavController,
                private readonly route: ActivatedRoute,
                private readonly actionSheet: ActionSheetController,
                private readonly file: FileService,
                private readonly sync: SynchronizationService,
                private readonly modal: ModalController,
                private readonly alert: AlertController,
                private readonly toast: ToastController,
                private readonly translate: TranslateService,
                private readonly dataProvider: DataProvider,
                private readonly ngZone: NgZone,
                private readonly footerToolbar: FooterToolbarService,
                private readonly browser: InAppBrowser,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                //TODO lp @Inject(OPEN_LEARNPLACE_ACTION_FACTORY)
                //TODO lp private readonly openLearnplaceActionFactory: OpenLearnplaceActionFunction,
                //TODO lp @Inject(REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION)
                //TODO lp private readonly removeLocalLearnplaceActionFactory: RemoveLocalLearnplaceActionFunction,
                @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
    ) {}

    /* = = = = = = = = = = = *
     *  GETTERS AND SETTERS  *
     * = = = = = = = = = = = */

    /**
     * setting the container whose content will be displayed
     */
    static setNavChild(child: ILIASObject): void {
        ObjectListPage.nav.child = child;
    }

    /**
     * getting the depth of the currently displayed container
     */
    static getNavDepth(): number {
        return ObjectListPage.nav.depth;
    }

    /**
     * sets the object whose details will be displayed
     */
    static setDetailsObject(object: ILIASObject): void {
        ObjectListPage.nav.details = object;
    }

    /**
     * returns the object whose details will be displayed
     */
    static getDetailsObject(): ILIASObject {
        return ObjectListPage.nav.details;
    }

    /* = = = = = = = *
     *  NAVIGATION   *
     * = = = = = = = */

    /**
     * changes displayed container to its parent
     */
    static async navigateBackInHierarchy(navCtrl: NavController, ngZone: NgZone): Promise<void> {
        ObjectListPage.nav.child = await ObjectListPage.nav.child.parent;
        await ngZone.run(() => navCtrl.navigateBack(`tabs/content/${ObjectListPage.getNavDepth()-1}/-1`));
    }

    /**
     * allows the template 'object-list.html' to invoke the static method 'navigateBackInHierarchy'
     */
    private async navigateBackInHierarchy(): Promise<void> {
        return ObjectListPage.navigateBackInHierarchy(this.navCtrl, this.ngZone);
    }

    /**
     * reading the favorites-field from the navigation-route and setting the current parent
     */
    private getNavigation(): void {
        const map: ParamMap = this.route.snapshot.paramMap;

        const depth: number = parseInt(map.get("depth"), 10);
        ObjectListPage.nav.depth = depth;
        if(!depth) ObjectListPage.nav.child = undefined;

        const favorites: number = parseInt(map.get("favorite"), 10);
        if(favorites !== -1) ObjectListPage.nav.favorites =  Boolean(favorites);
    }

    /**
     * load the content for the chosen ILIASObject
     */
    ionViewWillEnter(): void {
        this.getNavigation();
        this.updatePageState();
        this.setPageAttributes();
        this.loadContent();
    }

    /* = = = = = = = *
     *  PAGE STATE   *
     * = = = = = = = */

    /**
     * sets variables related to the page-content
     */
    private setPageAttributes(): void {
        this.parent = ObjectListPage.nav.child;

        if(this.parent) {
            this.pageTitle = this.parent.title;
            this.pageLayout = new PageLayout(this.parent.type);
            this.timeline = new TimeLine(this.parent.type);
        } else {
            this.pageTitle = "";
            this.translate.get((ObjectListPage.nav.favorites) ? "favorites.title" : "object-list.title").subscribe((lng) => this.pageTitle = lng);
            this.pageLayout = new PageLayout();
            this.timeline = new TimeLine();
        }
    }

    /**
     * updates the state-object of the page
     */
    updatePageState(renderView: boolean = true): void {
        function updateFn(page: ObjectListPage): void {
            page.state.favorites = ObjectListPage.nav.favorites;
            page.state.online = window.navigator.onLine;
            page.state.loadingLive = SynchronizationService.state.liveLoading;
            page.state.loadingOffline = SynchronizationService.state.loadingOfflineContent;
            page.state.desktop = page.parent === undefined;
        }

        renderView ? this.ngZone.run(() => updateFn(this)) : updateFn(this);
    }

    /**
     * checks whether the page is in a given state
     */
    checkPageState(state: Partial<PageState>): boolean {
        this.updatePageState(false);
        for(const p in state)
            if(state[p] !== this.state[p]) return false;
        return true;
    }

    /* = = = = = = = = = *
     *  LOADING CONTENT  *
     * = = = = = = = = = */

    /**
     * loads the content of the parent-container for display
     */
    async loadContent(event: any = undefined): Promise<void> {
        // update view for sync
        if(event) this.state.refreshing = true;
        this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));
        this.updatePageState();

        // execute sync
        if(ObjectListPage.nav.favorites) {
            if(this.state.online && this.state.refreshing) await this.ngZone.run(() => this.sync.loadAllOfflineContent());
            await this.ngZone.run(() => this.loadFavoritesObjectList());
        } else {
            if(this.state.online) await this.ngZone.run(() => this.liveLoadContent());
            await this.ngZone.run(() => this.loadCachedObjects(this.parent === undefined));
        }

        // update view after sync
        if(event) {
            event.target.complete();
            event.target.disabled = true;
            this.state.refreshing = false;
        }
        this.footerToolbar.removeJob(Job.Synchronize);
        if(event) event.target.disabled = false;
        this.updatePageState();
    }

    /**
     * loads available content without synchronization and user-feedback
     */
    async refreshContent(): Promise<void> {
        if(ObjectListPage.nav.favorites) await this.loadFavoritesObjectList();
        else await this.loadCachedObjects(this.parent === undefined);
        this.updatePageState();
    }

    /**
     * live-load content from account
     */
    async liveLoadContent(): Promise<void> {
        try {
            Log.write(this, "Sync start", [], []);
            await this.sync.liveLoad(this.parent);
        } catch (error) {
            Log.error(this, error);
            throw error;
        }
    }

    /**
     * load content from favorites
     */
    async loadFavoritesObjectList(): Promise<void> {
        if(this.parent === undefined) {
            Favorites.findByUserId(AuthenticationProvider.getUser().id)
                .then(favorites => {
                    favorites.sort(ILIASObject.compare);
                    this.content = favorites;
                });
        }
        else await this.loadCachedObjects(false);
    }

    /**
     * loads the object data from db cache
     */
    private async loadCachedObjects(isDesktopObject: boolean): Promise<void> {
        try {
            const user: User = AuthenticationProvider.getUser();
            this.content = (isDesktopObject) ?
                await DesktopItem.findByUserId(user.id) :
                await ILIASObject.findByParentRefId(this.parent.refId, user.id);

            this.content.sort(ILIASObject.compare);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /* = = = = = *
     *  ACTIONS  *
     * = = = = = */

    /**
     * execute primary action of given object
     */
    onClick(iliasObject: ILIASObject): void {
        const primaryAction: ILIASObjectAction = this.getPrimaryAction(iliasObject);
        this.executeAction(primaryAction);
        // When executing the primary action, we reset the isNew state
        if(iliasObject.isNew || iliasObject.isUpdated) {
            iliasObject.isNew = false;
            iliasObject.isUpdated = false;
            iliasObject.save();
        }
    }

    /**
     * returns the primary action for the given object
     */
    protected getPrimaryAction(iliasObject: ILIASObject): ILIASObjectAction {

        if(iliasObject.isLinked()) {
            return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
        }

        if(iliasObject.isContainer()) {
            return new ShowObjectListPageAction(this.translate.instant("actions.show_object_list"), iliasObject, this.navCtrl);
        }

        if(iliasObject.isLearnplace()) {
            //TODO lp return this.openLearnplaceActionFactory(this.nav, iliasObject.objId, iliasObject.title, this.modal);
        }

        if(iliasObject.type == "file") {
            return new DownloadAndOpenFileExternalAction(
                this.translate.instant("actions.download_and_open_in_external_app"),
                iliasObject,
                this.file,
                this.translate,
                this.alert
            );
        }

        return this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId));
    }

    executeAction(action: ILIASObjectAction): void {
        //const hash: number = action.instanceId();
        //this.footerToolbar.addJob(hash, "");
        action.execute().then((result) => {
            this.handleActionResult(result);
            //this.footerToolbar.removeJob(hash);
        }).catch((error) => {

            this.log.warn(() => `Could not execute action: action=${action.constructor.name}, error=${JSON.stringify(error)}`);
            //this.footerToolbar.removeJob(hash);
            throw error;
        }).then(() => this.refreshContent());
    }

    executeSetFavoriteValueAction(iliasObject: ILIASObject, value: boolean): void {
        this.updatePageState();
        if(!this.state.online) return;

        const actions: Array<ILIASObjectAction> = [];
        if(value) this.applyMarkAsFavoriteAction(actions, iliasObject);
        else this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.executeAction(actions.pop());
    }

    private handleActionResult(result: ILIASObjectActionResult): void {
        if(!result) return;
        if(result instanceof ILIASObjectActionSuccess) {
            if (result.message) {
                this.toast.create({
                    message: result.message,
                    duration: 3000
                }).then((it: HTMLIonToastElement) => it.present());
            }
        }
    }

    /**
     * show the action sheet for the given object
     */
    showActions(iliasObject: ILIASObject): void {
        this.updatePageState();
        const actions: Array<ILIASObjectAction> = [];

        this.applyDefaultActions(actions, iliasObject);
        this.applyMarkAsFavoriteAction(actions, iliasObject);
        this.applyUnmarkAsFavoriteAction(actions, iliasObject);
        this.applySynchronizeAction(actions, iliasObject);
        this.applyRemoveLocalFileAction(actions, iliasObject);
        this.applyRemoveLearnplaceAction(actions, iliasObject);

        const buttons: any = actions.map(action => {
            return {
                text: action.title,
                handler: (): void => {
                    // This action displays an alert before it gets executed
                    if (action.alert()) {
                        this.alert.create({
                            header: action.alert().title,
                            subHeader: action.alert().subTitle,
                            buttons: [
                                {
                                    text: this.translate.instant("cancel"),
                                    role: "cancel"
                                },
                                {
                                    text: "Ok",
                                    handler: (): void => {
                                        this.executeAction(action);
                                    }
                                }
                            ]
                        }).then(it => it.present());
                    } else {
                        this.executeAction(action);
                    }
                }
            };

        });

        buttons.push({
            text: this.translate.instant("cancel"),
            role: "cancel",
            handler: (): void => {
            }
        });

        this.actionSheet.create({
            header: iliasObject.title,
            buttons: buttons
        }).then(it => it.present());
    }

    private applyDefaultActions(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        actions.push(new ShowDetailsPageAction(this.translate.instant("actions.show_details"), iliasObject, this.navCtrl));
        if(this.state.online) actions.push(
            this.openInIliasActionFactory(this.translate.instant("actions.view_in_ilias"), this.linkBuilder.default().target(iliasObject.refId))
        );
    }

    private applyMarkAsFavoriteAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(!iliasObject.isFavorite && this.state.online) {
            actions.push(new MarkAsFavoriteAction(
                this.translate.instant("actions.mark_as_favorite"),
                iliasObject,
                this.sync
            ));
        }
    }

    private applyUnmarkAsFavoriteAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isFavorite) {
            actions.push(new UnMarkAsFavoriteAction(
                this.translate.instant("actions.unmark_as_favorite"),
                iliasObject,
                this.file
            ));
        }
    }

    private applySynchronizeAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isOfflineAvailable  && this.state.online && iliasObject.offlineAvailableOwner != ILIASObject.OFFLINE_OWNER_SYSTEM
            && (
                iliasObject.isContainer() && !iliasObject.isLinked() && !iliasObject.isLearnplace()
                ||
                iliasObject.isFile()
            )
        ) {
            actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
        }
    }

    private applyRemoveLocalFileAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        if(iliasObject.isContainer() && !iliasObject.isLinked() && !iliasObject.isLearnplace()) {
            actions.push(new RemoveLocalFilesAction(this.translate.instant("actions.remove_local_files"), iliasObject, this.file, this.translate));
        }

        if(iliasObject.isFile())
            actions.push(new RemoveLocalFileAction(this.translate.instant("actions.remove_local_file"), iliasObject, this.file, this.translate));

    }

    /**
     * opens the parent object or the timeline of the parent object in ILIAS
     */
    private openInIlias(timeline: boolean = false): void {
        if(this.parent == undefined) {
            throw new Exception("Can not open link for undefined. Do not call this method on ILIAS objects with no parent.");
        }

        const linkBuilder: TimelineLinkBuilder | DefaultLinkBuilder = timeline ? this.linkBuilder.timeline() : this.linkBuilder.default();
        const action: ILIASObjectAction = this.openInIliasActionFactory(
            this.translate.instant("actions.view_in_ilias"),
            linkBuilder.target(this.parent.refId)
        );
        this.executeAction(action);
    }

    private applyRemoveLearnplaceAction(actions: Array<ILIASObjectAction>, iliasObject: ILIASObject): void {
        /*TODO lp if(iliasObject.isLearnplace())
            actions.push(this.removeLocalLearnplaceActionFactory(
                this.translate.instant("actions.remove_local_learnplace"), iliasObject.objId, iliasObject.userId)
            );*/
    }
}
