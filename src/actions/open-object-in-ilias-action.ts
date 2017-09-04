import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {TokenLinkRewriter} from "../services/link-rewriter.service";
import {Subscription} from "rxjs/Subscription";
import {InAppBrowser} from "ionic-native";

export class OpenObjectInILIASAction
  extends ILIASObjectAction { constructor(
      public title:string,
      public iliasObject:ILIASObject,
      private readonly linkRewriter: TokenLinkRewriter
)

    { super() }


    public execute():Promise<ILIASObjectActionResult> {

      return new Promise((resolve, reject) => {

        let browser: InAppBrowser = new InAppBrowser(this.iliasObject.link, "_blank");

        let subscription: Subscription = browser.on("loadstop").subscribe(() => {
          this.linkRewriter.rewrite(this.iliasObject.link)
              .then(link => {
                return browser.executeScript({code: `window.open('${link}')`})
              })
              .then(() => {
                subscription.unsubscribe();
                resolve(new ILIASObjectActionNoMessage())
              })
              .catch(error => {
                subscription.unsubscribe();
                reject(error)
              })
        })
      });
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }
}
