import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASLink, TokenUrlConverter} from "../services/url-converter.service";
import {Subscription} from "rxjs/Subscription";
import {InAppBrowser, InAppBrowserObject, InAppBrowserOptions} from "@ionic-native/in-app-browser";

export class OpenObjectInILIASAction extends ILIASObjectAction {

  constructor(
      public title:string,
      public iliasLink: ILIASLink,
      private readonly urlConverter: TokenUrlConverter,
      private readonly browser: InAppBrowser
  ) { super() }

    public execute():Promise<ILIASObjectActionResult> {

      return new Promise((resolve, reject) => {

        let options: InAppBrowserOptions = {
          location: "no"
        };
        let browser: InAppBrowserObject = this.browser.create(this.iliasLink.originalUrl, "_blank", options);

        let subscription: Subscription = browser.on("loadstart").subscribe(() => {
          subscription.unsubscribe();

          this.urlConverter.convert(this.iliasLink)
              .then(link => {
                // the promise may not be executed depending on the hosts security settings
                browser.executeScript({code: `window.open('${link}')`});
                resolve(new ILIASObjectActionNoMessage())
              })
              .catch(error => {
                browser.close();
                reject(error)
              })
        })
      });
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }
}
