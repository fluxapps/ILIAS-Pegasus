import {Component, Inject} from "@angular/core";
import {LINK_BUILDER, LinkBuilder} from "../../services/link/link-builder.service";
import {Logging} from "../../services/logging/logging.service";
import {Logger} from "../../services/logging/logging.api";
import {HttpClient, HttpResponse} from "../../providers/http";

@Component({
  templateUrl: "test-hardware-feature.html"
})
export class HardwareFeaturePage {

  private log: Logger = Logging.getLogger(HardwareFeaturePage.name);

  /**
   * @param {LinkBuilder} linkBuilder
   * @param http
   */
  constructor(@Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder, private readonly http: HttpClient) {
    linkBuilder.news().newsId(29).context(89).build().then((result: string) => this.log.info(() => `News link: ${result}`));
    this.testResource().then(() => this.log.info(() => "request is done!"), () => this.log.info(() => "request is failed"));
    this.testNews().then(() => this.log.info(() => "request is done!"), () => this.log.info(() => "request is failed"));
  }

  async testResource(): Promise<void> {
    const link: string = await this.linkBuilder.resource().resource("data/default/xsrl_326/xsrl5a8b00e14abd06.46960540.mp4").build();
    this.log.info(() => `Resource link: ${link}`);
    const response: HttpResponse = await this.http.get(link);

    this.log.info(() => `Response code ${response.status}`);
    this.log.info(() => `Response ok? ${response.ok}`);
    this.log.info(() => `Response status text ${response.statusText}`);
  }

  async testNews(): Promise<void> {
    const link: string = await this.linkBuilder.news().newsId(29).context(89).build();
    this.log.info(() => `News link: ${link}`);
    const response: HttpResponse = await this.http.get(link);

    this.log.info(() => `Response code ${response.status}`);
    this.log.info(() => `Response ok? ${response.ok}`);
    this.log.info(() => `Response status text ${response.statusText}`);
  }
}
