import {ChangeDetectionStrategy, Component, Inject} from "@angular/core";
import {ILIASObject} from "../../models/ilias-object";
import {Builder} from "../../services/builder.base";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {NEWS_FEED, NewsFeed, NewsItemModel} from "../../services/news/news.feed";
import {SynchronizationService} from "../../services/synchronization.service";
import {ILIASObjectAction} from "../../actions/object-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {ILIASObjectPresenter} from "../../presenters/object-presenter";
import {TranslateService} from "@ngx-translate/core";
import {AuthenticationProvider} from "../../providers/authentication.provider";
import {ILIASObjectPresenterFactory} from "../../presenters/presenter-factory";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { first } from "rxjs/operators";

/**
 * Generated class for the NewsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: "newsPresenters",
    templateUrl: "news.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsPage
// implements OnInit
{

    newsPresenters: ReplaySubject<Array<[NewsItemModel, ILIASObjectPresenter]>> = new ReplaySubject(1);
    isLoading: BehaviorSubject<boolean> = new BehaviorSubject(true);
    private readonly log: Logger = Logging.getLogger(NewsPage.name);

    constructor(
        @Inject(NEWS_FEED) private readonly newsFeed: NewsFeed,
        private readonly translate: TranslateService,
        private readonly sync: SynchronizationService,
        readonly footerToolbar: FooterToolbarService,
        @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
        private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
        @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
        private readonly ilObjPresenterFactory: ILIASObjectPresenterFactory
    ) {
        this.newsPresenters.pipe(first()).subscribe(res => {
            this.isLoading.next(false);
        });
    }

    ionViewWillEnter(): void {
        this.startNewsSync()
        this.log.debug(() => "News view initialized.");
    }

    openNews(id: number, context: number): void {
        this.log.debug(() => `open news with id ${id}, context id ${context}`);
        const action: ILIASObjectAction = this.openInIliasActionFactory(
            this.translate.instant("actions.view_in_ilias"),
            this.linkBuilder.news().newsId(id).context(context)
        );

        this.executeAction(action);
    }

    /**
     * called by pull-to-refresh refresher
     */
    async startNewsSync(event: any = undefined): Promise<void> {
        try {
            await this.executeNewsSync();
        } finally {
            if(event) event.target.complete();
            this.reloadView();

        }
    }

    async reloadView(): Promise<void> {
        const newsPresenterItems = await this.fetchPresenterNewsTuples();
        this.newsPresenters.next(newsPresenterItems);
    }

    // ------------------- object-list duplicate ----------------------------
    private executeAction(action: ILIASObjectAction): void {
        const hash: number = action.instanceId();
        this.footerToolbar.addJob(hash, "");
        action.execute().then(() => {
            this.footerToolbar.removeJob(hash);
        }).catch((error) => {
            this.log.error(() => `action failed with message: ${error}`);
            this.footerToolbar.removeJob(hash);
            throw error;
        });
    }

    /**
     * executes news sync
     *
     * @returns {Promise<void>}
     */
    private async executeNewsSync(): Promise<void> {

        try {

            if (SynchronizationService.state.recursiveSyncRunning) {
                this.log.debug(() => "Sync is already running.");
                return;
            }

            this.log.info(() => "Sync start");
            this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));

            await this.sync.executeNewsSync();

            //maybe some objects came in new.
            this.footerToolbar.removeJob(Job.Synchronize);

        } catch (error) {

            this.log.error(() => `Error occured in sync implemented in news page. Error: ${error}`);
            this.footerToolbar.removeJob(Job.Synchronize);

            throw error;
        }
    }

    private async fetchPresenterByRefId(refId: number): Promise<ILIASObjectPresenter> {
        const userId: number = AuthenticationProvider.getUser().id;
        const ilObj: ILIASObject = await ILIASObject.findByRefIdAndUserId(refId, userId);
        return this.ilObjPresenterFactory.instance(ilObj);
    }

    private async fetchPresenterNewsTuples(): Promise<Array<[NewsItemModel, ILIASObjectPresenter]>> {
        const news: Array<NewsItemModel> = await this.newsFeed.fetchAllForCurrentUser();
        const mappedNews: Array<[NewsItemModel, ILIASObjectPresenter]> = [];
        for(const newsItem of news) {
            mappedNews.push([newsItem, await this.fetchPresenterByRefId(newsItem.newsContext)])
        }
        mappedNews.sort((a: [NewsItemModel, ILIASObjectPresenter], b: [NewsItemModel, ILIASObjectPresenter]): number => {
            return b[0].updateDate.getTime() - a[0].updateDate.getTime();
        });
        return mappedNews;
    }
}
