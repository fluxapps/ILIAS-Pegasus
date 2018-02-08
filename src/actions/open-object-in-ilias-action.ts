import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASLink, ILIASLinkBuilder, TokenUrlConverter} from "../services/url-converter.service";
import {Subscription} from "rxjs/Subscription";
import {InAppBrowser, InAppBrowserObject, InAppBrowserOptions} from "@ionic-native/in-app-browser";

export class OpenObjectInILIASAction extends ILIASObjectAction {

  constructor(
      public title: string,
      public linkBuilder: ILIASLinkBuilder,
      private readonly urlConverter: TokenUrlConverter,
      private readonly browser: InAppBrowser
  ) { super() }

    async execute(): Promise<ILIASObjectActionResult> {

      return new Promise<ILIASObjectActionResult>((resolve, reject): void => {

        try {

          const ilasLink: ILIASLink = this.linkBuilder.build();
          const loginPageLink: string = `${ilasLink.host}?target=ilias_app_login_page`;

          const options: InAppBrowserOptions = {
            location: "yes",
            clearcache: "yes",
            clearsessioncache: "yes"
          };
          const browser: InAppBrowserObject = this.browser.create(loginPageLink, "_blank", options);

          const subscription: Subscription = browser.on("loadstart").subscribe(async() => {
            subscription.unsubscribe();

            try {
              const url: string = await this.urlConverter.convert(ilasLink);
              await browser.executeScript({code: `window.open('${url}')`});
              resolve(new ILIASObjectActionNoMessage());
            }
            catch (error) {
              browser.close();
              reject(error);
            }

          })

        } catch (error) {
          reject(error)
        }
      });
    }

    alert(): ILIASObjectActionAlert|any {
        return undefined;
    }
}
