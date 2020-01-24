/** angular */
import {Inject, Injectable, InjectionToken} from "@angular/core";
/** providers */
import {NEWS_REST, NewsItem, NewsRest} from "../../providers/ilias/news.rest";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
/** misc */
import {NewsEntity} from "../../entity/news.entity";
import {User} from "../../models/user";
import {UserEntity} from "../../entity/user.entity";
import {AuthenticationProvider} from "../../providers/authentication.provider";

/**
 * The news synchronisation service synchronizes the news from ILIAS with the local stored news.
 * The synchronisation will only sync the news of the currently authenticated user.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export interface NewsSynchronization {

  /**
   * Synchronize the the news of the current authenticated user.
   *
   * @returns {Promise<void>}
   */
  synchronize(): Promise<void>;
}
export const NEWS_SYNCHRONIZATION: InjectionToken<NewsSynchronization> = new InjectionToken("token for news service synchronization");

/**
 * The standard implementation of news service synchronization.
 * The synchronization is done over the ILIAS REST plugin.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
@Injectable({
    providedIn: "root"
})
export class NewsSynchronizationImpl implements NewsSynchronization {


  constructor(
    @Inject(NEWS_REST)        private readonly newsRest: NewsRest,
    @Inject(USER_REPOSITORY)  private readonly userRepository: UserRepository
  ) {}

  /**
   * Synchronize the personal ILIAS news of the current authenticated user.
   *
   * @returns {Promise<void>}
   */
  async synchronize(): Promise<void> {
    const news: Array<NewsItem> = await this.newsRest.getNews();
    const mappedNews: Array<NewsEntity> = news.map(this.mapToEntity);

    const activeUser: User = AuthenticationProvider.getUser();
    if (activeUser !== undefined) {
        const user: UserEntity = (await this.userRepository.find(activeUser.id)).get();
        user.news = mappedNews;
        await this.userRepository.save(user);
    }
  }

  private mapToEntity(newsItem: NewsItem): NewsEntity {
    const entity: NewsEntity = new NewsEntity();

    entity.newsId = newsItem.newsId;
    entity.newsContext = newsItem.newsContext;
    entity.title = newsItem.title;
    entity.subtitle = newsItem.subtitle;
    entity.content = newsItem.content;
    entity.createDate = newsItem.createDate;
    entity.updateDate = newsItem.updateDate;

    return entity;
  }
}

