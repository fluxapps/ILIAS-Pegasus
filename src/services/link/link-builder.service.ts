
import {Inject, Injectable, InjectionToken} from "@angular/core";
import {DEFAULT_LINK_BUILDER, DefaultLinkBuilder} from "./default.builder";
import {TIMELINE_LINK_BUILDER, TimelineLinkBuilder} from "./timeline.builder";
import {NEWS_LINK_BUILDER, NewsLinkBuilder} from "./news.builder";
import {LOGIN_LINK_BUILDER, LoginLinkBuilder} from "./login.builder";
import {LOADING_LINK_BUILDER, LoadingLinkBuilder} from "./loading.builder";
import {RESOURCE_LINK_BUILDER, ResourceLinkBuilder} from "./resource.builder";

/**
 * Builds links for various ILIAS elements.
 * All the generated links are intercepted and handled by the ILIAS pegasus helper plugin.
 *
 * @author Nicolas Schäfli <ns@studer-raimann.ch>
 */
export interface LinkBuilder {

  /**
   * Builder which allows to create links to an arbitrary ILIAS object by ref id.
   *
   * @returns {DefaultLinkBuilder}  The builder which is used to build the link.
   */
  default(): DefaultLinkBuilder;

  /**
   * Timeline link builder which allows to create links to an arbitrary ILIAS object with timeline by ref id.
   *
   * @returns {TimelineLinkBuilder} The builder which is used to build the link.
   */
  timeline(): TimelineLinkBuilder;

  /**
   * The news link builder which allows to build links to personal news pages.
   *
   * @returns {NewsLinkBuilder} The builder which is used to build the link.
   */
  news(): NewsLinkBuilder;

  /**
   * Creates a link to a custom pegasus loading page with a spinning pony.
   *
   * @returns {LoadingLinkBuilder} The builder which is used to build the link.
   */
  loadingPage(): LoadingLinkBuilder;

  /**
   * Creates a link builder which generates a link to the ILIAS login page.
   *
   * @returns {LoginLinkBuilder} The builder which is used to build the link.
   */
  loginPage(): LoginLinkBuilder;

  /**
   * The resource link builder creates a link to ILIAS resources like pictures.
   * This is necessary because the ILIAS web access checker would deny the picture access due to
   * a missing user authentication.
   *
   * @returns {ResourceLinkBuilder} The builder which is used to build the link.
   */
  resource(): ResourceLinkBuilder;
}

export const LINK_BUILDER: InjectionToken<LinkBuilder> = new InjectionToken("token for loading link builder");

@Injectable()
export class LinkBuilderImpl implements LinkBuilder {

  constructor(
    @Inject(DEFAULT_LINK_BUILDER) private readonly defaultLinkBuilder: () => DefaultLinkBuilder,
    @Inject(TIMELINE_LINK_BUILDER) private readonly timelineLinkBuilder: () => TimelineLinkBuilder,
    @Inject(NEWS_LINK_BUILDER) private readonly newsLinkBuilder: () => NewsLinkBuilder,
    @Inject(LOGIN_LINK_BUILDER) private readonly loginLinkBuilder: () => LoginLinkBuilder,
    @Inject(LOADING_LINK_BUILDER) private readonly loadingLinkBuilder: () => LoadingLinkBuilder,
    @Inject(RESOURCE_LINK_BUILDER) private readonly resourceLinkBuilder: () => ResourceLinkBuilder
  ) {}


  default(): DefaultLinkBuilder {
    return this.defaultLinkBuilder();
  }

  timeline(): TimelineLinkBuilder {
    return this.timelineLinkBuilder();
  }

  news(): NewsLinkBuilder {
    return this.newsLinkBuilder();
  }

  loadingPage(): LoadingLinkBuilder {
    return this.loadingLinkBuilder();
  }

  loginPage(): LoginLinkBuilder {
    return this.loginLinkBuilder();
  }

  resource(): ResourceLinkBuilder {
    return this.resourceLinkBuilder();
  }
}
