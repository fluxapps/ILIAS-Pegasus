import {Inject, InjectionToken} from "@angular/core";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {User} from "../../models/user";
import {UserEntity} from "../../entity/user.entity";
import {NewsEntity} from "../../entity/news.entity";

/**
 * ILIAS news feed which provides the already synchronized
 * news for the authenticated user.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export interface NewsFeed {
  fetchAllForCurrentUser(): Promise<Array<NewsItemModel>>;
}
export const NEWS_FEED: InjectionToken<NewsFeed> = new InjectionToken("token for news service -> news feed");

/**
 * The news model which holds the data required to
 * display the news.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export class NewsItemModel {

  constructor(
    readonly newsId: number,
    readonly newsContext: number,
    readonly title: string,
    readonly subtitle: string = "",
    readonly content: string = "",
    readonly createDate: Date = new Date(Date.now()),
    readonly updateDate: Date = new Date(Date.now())
  ){}
}

/**
 * The standard news feed implementation which loads the
 * preloaded news over the standard database connection.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export class NewsFeedImpl implements NewsFeed {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}


  async fetchAllForCurrentUser(): Promise<Array<NewsItemModel>> {
    const activeUser: User = await User.findActiveUser();
    const user: UserEntity = (await this.userRepository.find(activeUser.id)).get();
    return user.news.map(this.mapToModel);
  }

  private mapToModel(entity: NewsEntity): NewsItemModel {
    return new NewsItemModel(
      entity.newsId,
      entity.newsContext,
      entity.title,
      entity.subtitle,
      entity.content,
      new Date(entity.createDate),
      new Date(entity.updateDate)
    );
  }
}
