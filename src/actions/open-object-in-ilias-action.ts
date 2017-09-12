import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {ILIASLink, TokenUrlConverter} from "../services/link-rewriter.service";
import {Subscription} from "rxjs/Subscription";
import {InAppBrowser} from "ionic-native";
import {Exception} from "../exceptions/Exception";

export class OpenObjectInILIASAction extends ILIASObjectAction {

  constructor(
      public title:string,
      public iliasLink: ILIASLink,
      private readonly urlConverter: TokenUrlConverter
  ) { super() }

    public execute():Promise<ILIASObjectActionResult> {

      // return new Promise((resolve, reject) => {
      //
      //   let browser: InAppBrowser = new InAppBrowser(this.iliasObject.link, "_blank", "location=no");
      //
      //   let subscription: Subscription = browser.on("loadstart").subscribe(() => {
      //     subscription.unsubscribe();
      //
      //     this.linkRewriter.rewrite(this.iliasObject.link)
      //         .then(link => {
      //           // the promise may not be executed depending on the hosts security settings
      //           browser.executeScript({code: `window.open('${link}')`});
      //           resolve(new ILIASObjectActionNoMessage())
      //         })
      //         .catch(error => {
      //           browser.close();
      //           reject(error)
      //         })
      //   })
      // });
      throw new Exception("This method is not implemented yet");
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }
}
