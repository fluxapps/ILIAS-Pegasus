import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASLink, TokenUrlConverter} from "../services/url-converter.service";
import {Subscription} from "rxjs/Subscription";
import {InAppBrowser} from "ionic-native";

export class OpenObjectInILIASAction extends ILIASObjectAction {

  constructor(
      public title:string,
      public iliasLink: ILIASLink,
      private readonly urlConverter: TokenUrlConverter
  ) { super() }

    public execute():Promise<ILIASObjectActionResult> {

      return new Promise((resolve, reject) => {

        // TODO: use either ILIAS link or a provided url -> WIP
        let browser: InAppBrowser = new InAppBrowser(this.iliasLink.originalUrl, "_blank", "location=no");

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
