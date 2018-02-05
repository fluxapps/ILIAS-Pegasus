import {Component, Inject} from "@angular/core";
import {NEWS_FEED, NewsFeed, NewsItemModel} from "../../services/news/news.feed";
import {Refresher, Toast, ToastController, ToastOptions} from "ionic-angular";
import {NEWS_SYNCHRONIZATION, NewsSynchronization} from "../../services/news/news.synchronization";
import {TimeoutError} from "rxjs/Rx";
import {HttpRequestError} from "../../providers/http";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
import {TranslateService} from "ng2-translate/src/translate.service";

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
export class NewsPage {

  private static readonly TOAST_LIFETIME: number = 6000;

  news: Array<NewsItemModel>;
  private readonly log: Logger = Logging.getLogger("NewsPage");


  constructor(
    @Inject(NEWS_FEED) private readonly newsFeed: NewsFeed,
    @Inject(NEWS_SYNCHRONIZATION) private readonly newsSync: NewsSynchronization,
    private readonly toast: ToastController,
    private readonly translate: TranslateService,
  ) {

    this.loadNewsFeed();
  }

  /**
   * called by pull-to-refresh refresher
   *
   * @param {Refresher} refresher
   * @returns {Promise<void>}
   */
  private async startSync(refresher: Refresher): Promise<void> {
    try {
      await this.newsSync.synchronize();
      await this.loadNewsFeed();
    }
    catch (error) {
      if(error instanceof TimeoutError) {
        this.log.warn(() => "Unable to sync news due to request timeout.");
        await this.showToast("actions.server_not_reachable");
        return;
      }

      if(error instanceof HttpRequestError) {
        this.log.warn(() => "Unable to sync news due to http request error.");
        await this.showToast("actions.server_not_reachable");
        return;
      }

      //delegate unknown errors to global error handler
      throw error;
    }
    finally {
      refresher.complete();
    }
  }

  /**
   * Loads all news of the current user out of the database.
   *
   * @returns {Promise<void>}
   */
  private async loadNewsFeed(): Promise<void> {
    this.news = await this.newsFeed.fetchAllForCurrentUser();
  }

  private async showToast(languageVar: string): Promise<void> {
    const toast: Toast = this.toast.create(<ToastOptions> {
      message: <string>await this.translate.get(languageVar).toPromise(),
      duration: NewsPage.TOAST_LIFETIME
    });

    await toast.present();
  }

}
