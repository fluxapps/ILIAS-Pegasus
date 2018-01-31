/**
 * The definition of the news rest response.
 *
 * Response definition of /v2/ilias-app/news
 *
 * @author nschaefli <ns@studer-raimann.ch>
 *
 * @property {number} newsId      - The unique news identifier.
 * @property {number} newsContext - Ref id of the context object of the news object. For example an uploaded file to within a course would have the course as context object.
 * @property {string} title       - The title of the news.
 * @property {string} subtitle    - The subtitle of the news.
 * @property {string} content     - The content of the news.
 * @property {number} createDate  - The creation date of the news as unix epoch timestamp.
 * @property {number} updateDate  - The latest update date of the news as unix epoch timestamp.
 */
import {ILIAS_REST, ILIASRequestOptions, ILIASRest} from "./ilias.rest";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {HttpResponse} from "../http";

export interface NewsItem {
  readonly newsId: number;
  readonly newsContext: number;
  readonly title: string;
  readonly subtitle: string;
  readonly content: string;
  readonly createDate: string;
  readonly updateDate: string;
}

/**
 * News rest service which fetches news data for the currently authenticated
 * user.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
export interface NewsRest {

  /**
   * Fetches all ILIAS news item of the currently authenticated user.
   *
   * @returns {Array<NewsItem>}
   */
  getNews(): Promise<Array<NewsItem>>;
}
export const NEWS_REST: InjectionToken<NewsRest> = new InjectionToken("token for ILIAS news rest interface");

/**
 * The standard implementation of the news rest interface.
 *
 * @author nschaefli <ns@studer-raimann.ch>
 */
@Injectable()
export class NewsRestImpl implements NewsRest {

  private readonly REST_PATH: string = "/v2/ilias-app/news";

  constructor(
    @Inject(ILIAS_REST) private readonly rest: ILIASRest
  ) {}

  /**
   * Fetches all news of the actually authenticated user.
   *
   * Used rest route: /v2/ilias-app/news.
   *
   * @returns {Promise<Array<NewsItem>>}
   */
  async getNews(): Promise<Array<NewsItem>> {
    const result: HttpResponse = await this.rest.get(this.REST_PATH, <ILIASRequestOptions>{
      accept: "application/json",
    });

    return result.handle<Array<NewsItem>>(async(it) => {
      return it.json<Array<NewsItem>>(jsonSchema);
    });
  }
}

/**
 * The json schema as described in the api blue blueprints.
 */
const jsonSchema: {} = {
  "title": "News",
  "type": "object",
  "properties": {
    "newsId": {
      "description": "The numeric news identifier.",
      "type": "integer",
      "minimum": 1
    },
    "refId": {
      "description": "The ILIAS object reference identifier.",
      "type": "integer",
      "minimum": 1
    },
    "userRead": {
      "description": "True if the user has red the news content, otherwise false.",
      "type": "boolean"
    },
    "title": {
      "description": "The title of the news entry.",
      "type": "string",
      "pattern": "^.{1,}$"
    },
    "content": {
      "description": "The content of the news entry.",
      "type": "string"
    },
    "subtitle": {
      "description": "The subtitle of the news entry",
      "type": "string"
    },
    "createDate": {
      "description": "The create date of the news entry as unix epoch time.",
      "type": "integer",
      "minimum": 1
    },
    "updateDate": {
      "description": "The update date of the news entry as unix epoch time.",
      "type": "integer",
      "minimum": 1
    }
  },
  "required": [ "newsId", "refId", "userRead", "title", "content", "subtitle", "createDate", "updateDate" ]
};
