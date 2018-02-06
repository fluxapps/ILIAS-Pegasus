import {AfterViewInit, Component, Inject} from "@angular/core";
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

/**
 * Generated class for the NewsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "news",
  templateUrl: "news.html"
})
export class NewsPage implements AfterViewInit {

  news: Array<NewsItemModel>;
  private readonly log: Logger = Logging.getLogger(NewsPage.name);


  constructor(
    @Inject(NEWS_FEED) private readonly newsFeed: NewsFeed,
    private readonly translate: TranslateService,
    private readonly sync: SynchronizationService,
    private readonly alert: AlertController,
    private readonly footerToolbar: FooterToolbarService,
    private readonly modal: ModalController,
  ) {}


  ngAfterViewInit(): void {
    this.newsFeed.fetchAllForCurrentUser().then((newsItems: Array<NewsItemModel>) => this.news = newsItems);
  }

  // ------------------- object-list duplicate----------------------------
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
        this.log.warn(() => "Unable to sync news no wlan active.");
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
        this.log.warn(() => "Unable to sync news due to request timeout.");
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
            alert.dismiss().then(() => this.log.debug(() => `Alert with title "${title}" dismissed.`));
          }
        }
      ]
    });
    alert.present().then(() => this.log.debug(() => `Alert with title "${title}" presented.`));
  }
}
