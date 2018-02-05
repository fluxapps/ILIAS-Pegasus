import {Component, Inject} from "@angular/core";
import {NEWS_FEED, NewsFeed, NewsItemModel} from "../../services/news/news.feed";
import {Refresher} from "ionic-angular";
import {NEWS_SYNCHRONIZATION, NewsSynchronization} from "../../services/news/news.synchronization";

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

  news: Array<NewsItemModel>;


  constructor(
    @Inject(NEWS_FEED) private readonly newsFeed: NewsFeed,
    @Inject(NEWS_SYNCHRONIZATION) private readonly newsSync: NewsSynchronization
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
    await this.newsSync.synchronize();
    await this.loadNewsFeed();
    refresher.complete();
  }

  /**
   * Loads all news of the current user out of the database.
   *
   * @returns {Promise<void>}
   */
  private async loadNewsFeed(): Promise<void> {
    this.news = await this.newsFeed.fetchAllForCurrentUser();
  }

}
