import {AfterViewInit, Component, Inject} from "@angular/core";
import {ILIASObjectAction} from "../../actions/object-action";
import {OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY, OpenObjectInILIASAction} from "../../actions/open-object-in-ilias-action";
import {CantOpenFileTypeException} from "../../exceptions/CantOpenFileTypeException";
import {OfflineException} from "../../exceptions/OfflineException";
import {Builder} from "../../services/builder.base";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {Log} from "../../services/log.service";
import {NEWS_FEED, NewsFeed, NewsItemModel} from "../../services/news/news.feed";
import {Alert, AlertController, AlertOptions, Modal, ModalController, Refresher} from "ionic-angular";
import {TimeoutError} from "rxjs/Rx";
import {HttpRequestError} from "../../providers/http";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {TranslateService} from "ng2-translate/src/translate.service";
import {SynchronizationService, SyncResults} from "../../services/synchronization.service";
import {SyncFinishedModal} from "../sync-finished-modal/sync-finished-modal";
import {NoWLANException} from "../../exceptions/noWLANException";
import {RESTAPIException} from "../../exceptions/RESTAPIException";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {AlertButton} from "ionic-angular/components/alert/alert-options";
import {ILIASObjectPresenter} from "../../presenters/object-presenter";
import {ILIASObject} from "../../models/ilias-object";
import {User} from "../../models/user";

/**
 * Generated class for the NewsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "newsPresenters",
  templateUrl: "news.html"
})
export class NewsPage implements AfterViewInit {

  newsPresenters: Array<[NewsItemModel, ILIASObjectPresenter]>;
  private readonly log: Logger = Logging.getLogger(NewsPage.name);


  constructor(
    @Inject(NEWS_FEED) private readonly newsFeed: NewsFeed,
    private readonly translate: TranslateService,
    private readonly sync: SynchronizationService,
    private readonly alert: AlertController,
    private readonly footerToolbar: FooterToolbarService,
    private readonly modal: ModalController,
    @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
    private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
    @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder
  ) {}


  ngAfterViewInit(): void {
    this.log.debug(() => "News view initialized.");
    this.fetchPresenterNewsTuples().then(
      (newsPresenterItems: Array<[NewsItemModel, ILIASObjectPresenter]>) => {this.newsPresenters = newsPresenterItems});
  }

  openNews(id: number, context: number): void {
    this.log.debug(() => `open news with id ${id}, context id ${context}`);
    const action: ILIASObjectAction = this.openInIliasActionFactory(
      this.translate.instant("actions.view_in_ilias"),
      this.linkBuilder.news().newsId(id).context(context)
    );

    this.executeAction(action);
  }

  // ------------------- object-list duplicate----------------------------
  private executeAction(action: ILIASObjectAction): void {
    const hash: number = action.instanceId();
    this.footerToolbar.addJob(hash, "");
    action.execute().then(() => {
      this.footerToolbar.removeJob(hash);
    }).catch((error: CantOpenFileTypeException) => {
      if (error instanceof CantOpenFileTypeException) {
        this.showAlert(this.translate.instant("actions.cant_open_file"));
        this.footerToolbar.removeJob(hash);
        return Promise.resolve();
      }
      return Promise.reject(error);
    }).catch((error) => {
      if (error instanceof NoWLANException) {
        this.footerToolbar.removeJob(Job.Synchronize);
        this.displayAlert(this.translate.instant("sync.title"), this.translate.instant("sync.stopped_no_wlan"));
        return Promise.resolve();
      }
      return Promise.reject(error);
    }).catch(error => {
      if (error instanceof OfflineException) {
        this.showAlert(this.translate.instant("actions.offline_and_no_local_file"));
        this.footerToolbar.removeJob(hash);
        return Promise.resolve();
      }
      return Promise.reject(error);
    }).catch(error => {
      if (error instanceof RESTAPIException) {
        this.showAlert(this.translate.instant("actions.server_not_reachable"));
        this.footerToolbar.removeJob(hash);
        return Promise.resolve();
      }
      return Promise.reject(error);

    }).catch((message) => {
      if (message) {
        this.log.error(() => `action failed with message: ${message}`);
      }

      this.showAlert(this.translate.instant("something_went_wrong"));
      this.footerToolbar.removeJob(hash);
    });
  }

  private showAlert(message: string): void {
    const alert: Alert = this.alert.create(<AlertOptions>{
      title: message,
      buttons: [
        <AlertButton>{
          text: this.translate.instant("close"),
          role: "cancel"
        }
      ]
    });
    alert.present();
  }

  /**
   * called by pull-to-refresh refresher
   *
   * @param {Refresher} refresher
   * @returns {Promise<void>}
   */
  async startSync(refresher: Refresher): Promise<void> {
    await this.executeSync();
    refresher.complete();
  }

  /**
   * executes global sync
   *
   * @returns {Promise<void>}
   */
  private async executeSync(): Promise<void> {

    try {

      this.log.info(() => "Sync start");
      this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));

      const syncResult: SyncResults = await this.sync.execute();

      // We have some files that were marked but not downloaded. We need to explain why and open a modal.
      if (syncResult.objectsLeftOut.length > 0) {
        const syncModal: Modal = this.modal.create(SyncFinishedModal, {syncResult: syncResult});
        await syncModal.present();
      }

      //maybe some objects came in new.
      this.footerToolbar.removeJob(Job.Synchronize);

    } catch (error) {

      this.log.error(() => `Error occured in sync implemented in news page. Error: ${error}`);

      this.footerToolbar.removeJob(Job.Synchronize);

      if (error instanceof NoWLANException) {
        this.log.warn(() => "Unable to sync newsPresenters no wlan active.");
        this.displayAlert(<string>this.translate.instant("sync.title"), this.translate.instant("sync.stopped_no_wlan"));
        return;
      }

      if (error instanceof RESTAPIException) {
        this.log.warn(() => "Unable to sync server not reachable.");
        this.displayAlert(<string>this.translate.instant("sync.title"), this.translate.instant("actions.server_not_reachable"));
        return;
      }

      if (this.sync.isRunning) {
        this.log.debug(() => "Sync is already running.");
        this.displayAlert(<string>this.translate.instant("sync.title"), this.translate.instant("sync.sync_already_running"));
        return;
      }

      if(error instanceof TimeoutError) {
        this.log.warn(() => "Unable to sync newsPresenters due to request timeout.");
        this.displayAlert(<string>this.translate.instant("sync.title"), this.translate.instant("actions.server_not_reachable"));
        return;
      }

      if(error instanceof HttpRequestError) {
        this.log.warn(() => `Unable to sync news due to http request error "${error.statuscode}".`);
        this.displayAlert(<string>this.translate.instant("sync.title"), this.translate.instant("actions.server_not_reachable"));
        return;
      }

      throw error;
    }
  }

  private displayAlert(title: string, message: string): void {
    const alert: Alert = this.alert.create(<AlertOptions>{
      title: title,
      message: message,
      buttons: [
        <AlertButton>{
          text: "Ok",
          handler: ( _: boolean): void => {
            this.log.debug(() => `Alert with title "${title}" dismissed.`);
          }
        }
      ]
    });
    alert.present().then(() => this.log.debug(() => `Alert with title "${title}" presented.`));
  }

  private async fetchPresenterByRefId(refId: number): Promise<ILIASObjectPresenter> {
    const userId: number = (await User.currentUser()).id;
    return (await ILIASObject.findByRefId(refId, userId)).presenter;
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
