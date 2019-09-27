/** angular */
import {Component, Inject, NgZone} from "@angular/core";
import {ActivatedRoute, ParamMap, ActivatedRouteSnapshot, Router, ResolveEnd} from "@angular/router";
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
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {Exception} from "../../exceptions/Exception";
import {DataProvider} from "../../providers/data-provider.provider";
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";
import {TimelineLinkBuilder} from "../../services/link/timeline.builder";
import {DefaultLinkBuilder} from "../../services/link/default.builder";
import {Observable} from "rxjs";
import {filter} from "rxjs/operators";

// used for navigation from one container into another one
interface ContentNavParams {
    favorites: boolean,
    depth: number,
    child: ILIASObject,
    details: ILIASObject
}

// summarizes the state of the currently displayed object-list-page
interface PageState {
    favorites: boolean,
    online: boolean,
    loading: boolean,
    loadingLive: boolean,
    loadingOffline: boolean,
    refreshing: boolean,
    desktop: boolean,
}

@Component({
    selector: "page-object-list",
    templateUrl: "object-list.html",
})
export class ObjectListPage {
    static readonly nav: ContentNavParams = {
        favorites: undefined,
        depth: undefined,
        child: undefined,
        details: undefined
    };

    state: PageState = {
        favorites: undefined,
        online: undefined,
        loading: false,
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
                private readonly router: Router,
                private readonly route: ActivatedRoute,
                private readonly actionSheet: ActionSheetController,
                private readonly file: FileService,
                private readonly sync: SynchronizationService,
                private readonly modal: ModalController,
                private readonly alert: AlertController,
                private readonly toast: ToastController,
                private readonly translate: TranslateService,
                private readonly ngZone: NgZone,
                private readonly footerToolbar: FooterToolbarService,
                @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
                private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
                @Inject(LINK_BUILDER)
                private readonly linkBuilder: LinkBuilder
                //TODO lp @Inject(OPEN_LEARNPLACE_ACTION_FACTORY)
                //TODO lp private readonly openLearnplaceActionFactory: OpenLearnplaceActionFunction,
                //TODO lp @Inject(REMOVE_LOCAL_LEARNPLACE_ACTION_FUNCTION)
                //TODO lp private readonly removeLocalLearnplaceActionFactory: RemoveLocalLearnplaceActionFunction,
    ) {}

    /* = = = = = = = *
     *  NAVIGATION   *
     * = = = = = = = */

    /**
     * setting the container whose content will be displayed
     */
    static setNavChild(child: ILIASObject): void {
        ObjectListPage.nav.child = child;
    }

    /**
     * sets the object whose details will be displayed
     */
    static setNavDetailsObject(object: ILIASObject): void {
        ObjectListPage.nav.details = object;
    }

    /**
     * changes displayed container to its parent
     */
    static async navigateBackInHierarchy(navCtrl: NavController): Promise<void> {
        ObjectListPage.nav.child = await ObjectListPage.nav.child.parent;
        const tab: string = ObjectListPage.nav.favorites ? "favorites" : "content";
        const depth: number = ObjectListPage.nav.depth-1;
        await navCtrl.navigateBack(`tabs/${tab}/${depth}`);
    }

    /**
     * same as navigateBackInHierarchy above, but callable from html-template
     */
    private async navigateBackInHierarchy(): Promise<void> {
        await ObjectListPage.navigateBackInHierarchy(this.navCtrl);
    }

    /**
     * load navigation parameters for this page from routing
     */
    private updateNavParams(): void {
        const url: string = this.router.url;
        const params: ParamMap = this.route.snapshot.paramMap;

        ObjectListPage.nav.depth = parseInt(params.get("depth"), 10);
        ObjectListPage.nav.favorites = Boolean(url.match(/favorites/));
        if(!ObjectListPage.nav.depth) ObjectListPage.nav.child = undefined;
    }

    /* = = = = = = = *
     *  PAGE STATE   *
     * = = = = = = = */

    /**
     * sets variables related to the page-content
     */
    private setPageAttributes(): void {
        this.content = [];
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
     * method to set values of this.state, after which the view will be rendered
     */
    private setPageStateAndRender(state: Partial<PageState>): void {
        for(const p in state)
            this.state[p] = state[p];
        this.updatePageState();
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
     * ionic will-enter-event: show that content will be loaded
     */
    ionViewWillEnter(): void {
        this.updateNavParams();
        this.setPageAttributes();
        this.setPageStateAndRender({loading: true});
    }

    /**
     * ionic did-enter-event: load content and display result
     */
    async ionViewDidEnter(): Promise<void> {
        await this.loadAndRenderContent();
    }

    /**
     * loads the content of the parent-container for display
     */
    async loadAndRenderContent(event: any = undefined): Promise<void> {
        this.setPageStateAndRender({loading: true});
        if(event) {
            event.target.complete();
            event.target.disabled = true;
        }

        // execute sync
        if(ObjectListPage.nav.favorites) {
            if(this.state.online && event) await this.sync.loadAllOfflineContent();
            await this.setLoadedFavorites();
        } else {
            if(this.state.online) await this.sync.liveLoad(this.parent);
            await this.setLiveLoadedContent(this.parent === undefined);
        }

        // update view after sync
        this.footerToolbar.removeJob(Job.Synchronize);
        if(event) event.target.disabled = false;
        this.setPageStateAndRender({loading: false});
    }

    /**
     * loads available content without synchronization and user-feedback
     */
    async refreshContent(): Promise<void> {
        if(ObjectListPage.nav.favorites) await this.setLoadedFavorites();
        else await this.setLiveLoadedContent(this.parent === undefined);
        this.updatePageState();
    }

    /**
     * load favorites from db cache
     */
    async setLoadedFavorites(): Promise<void> {
        const favorites: Array<ILIASObject> = (this.parent === undefined) ?
            await ILIASObject.getFavoritesByUserId(AuthenticationProvider.getUser().id) :
            await ILIASObject.findByParentRefId(this.parent.refId, AuthenticationProvider.getUser().id);
        this.sortAndSetObjectList(favorites);
    }

    /**
     * loads the object data from db cache
     */
    private async setLiveLoadedContent(isDesktopObject: boolean): Promise<void> {
        const user: User = AuthenticationProvider.getUser();
        const content: Array<ILIASObject> = (isDesktopObject) ?
            await DesktopItem.findByUserId(user.id) :
            await ILIASObject.findByParentRefId(this.parent.refId, user.id);
        this.sortAndSetObjectList(content);
    }

    /**
     * sort the given array of ILIAS-objects and reference them in th content-variable
     */
    private sortAndSetObjectList(content: Array<ILIASObject>): void {
        content.sort(ILIASObject.compare);
        this.content = content;
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
            return this.openInIliasActionFactory(
                this.translate.instant("actions.view_in_ilias"),
                this.linkBuilder.default().target(iliasObject.refId)
            );
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
        if(iliasObject.isFavorite  && this.state.online) {
            actions.push(new SynchronizeAction(this.translate.instant("actions.synchronize"), iliasObject, this.sync, this.modal, this.translate));
        }
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
}
