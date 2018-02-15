import {Builder} from "../builder.base";
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {INSTALLATION_LINK_PROVIDER, InstallationLinkSupplier, TOKEN_SUPPLIER, TokenSupplier} from "./link-builder.supplier";
import {USER_REPOSITORY, UserRepository} from "../../providers/repository/repository.user";
import {IllegalStateError, NoSuchElementError} from "../../error/errors";
import {UserEntity} from "../../entity/user.entity";

/**
 * News link builder, builds links to personal ILIAS news pages.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface NewsLinkBuilder extends Builder<Promise<string>> {

  /**
   * Sets the news identifier which is used to link to the correct news article.
   *
   * @param {number} id         The identifier of the news item the link should point to.
   *
   * @returns {NewsLinkBuilder} The link builder it self for fluent chaining.
   */
  newsId(id: number): NewsLinkBuilder;

  /**
   * The context id of the news which should be displayed.
   * This is a ref id used by ILIAS to show the context of the news, for example
   * for forum entry news items the context would be the ref id of the form it self.
   *
   * @param {number} context        The news context identifier.
   *
   * @returns {NewsLinkBuilder}     The link builder it self for fluent chaining.
   */
  context(context: number): NewsLinkBuilder;
}

export const NEWS_LINK_BUILDER: InjectionToken<NewsLinkBuilder> = new InjectionToken("token for news link builder");

@Injectable()
export class NewsLinkBuilderImpl implements NewsLinkBuilder {

  private id: number = -1;
  private contextId: number = -1;

  constructor(
    @Inject(INSTALLATION_LINK_PROVIDER) private readonly installationLinkSupplier: InstallationLinkSupplier,
    @Inject(TOKEN_SUPPLIER) private readonly tokenSupplier: TokenSupplier,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {}

  /**
   * Sets the news identifier which is used to link to the correct news article.
   *
   * @param {number} id         The identifier of the news item the link should point to.
   *
   * @returns {NewsLinkBuilder} The link builder it self for fluent chaining.
   */
  newsId(id: number): NewsLinkBuilder {
    this.id = id;
    return this;
  }

  /**
   * The context id of the news which should be displayed.
   * This is a ref id used by ILIAS to show the context of the news, for example
   * for forum entry news items the context would be the ref id of the form it self.
   *
   * @param {number} context        The news context identifier.
   *
   * @returns {NewsLinkBuilder}     The link builder it self for fluent chaining.
   */
  context(context: number): NewsLinkBuilder {
    this.contextId = context;
    return this;
  }

  /**
   * Builds the news token with a ready to use auth token.
   *
   * @returns {Promise<string>} The build news url.
   */
  async build(): Promise<string> {
    this.validateBuilderState();

    const user: UserEntity = (await this.userRepository.findAuthenticatedUser())
      .orElseThrow(() => new NoSuchElementError("No authenticated user found, unable to build news ILIAS link."));

    const token: string = await this.tokenSupplier.get();
    const installation: string = await this.installationLinkSupplier.get();
    return `${installation}/goto.php?target=ilias_app_news|${user.iliasUserId}|${this.id}|${this.contextId}|${token}`;
  }

  /**
   * Validates the state of the builder.
   * If the builder is not ready for the build state
   * an error will be thrown.
   */
  private validateBuilderState(): void {
    if(this.id <= 0)
      throw new IllegalStateError("Required news id was not found, ILIAS news link build failed.");
    if(this.contextId <= 0)
      throw new IllegalStateError("Required news context id was not found, ILIAS news link build failed.");
  }
}
