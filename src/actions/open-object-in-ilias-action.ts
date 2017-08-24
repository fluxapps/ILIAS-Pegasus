import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {InAppBrowser} from "ionic-native";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";
import {TokenLinkRewriter} from "../services/link-rewriter.service";


export class OpenObjectInILIASAction extends ILIASObjectAction {

    public constructor(public title:string, public iliasObject:ILIASObject, private readonly linkRewriter: TokenLinkRewriter) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {


      return this.linkRewriter.rewrite(this.iliasObject.link)
        .then(link => {
          new InAppBrowser(link, '_system');
          return Promise.resolve(new ILIASObjectActionNoMessage());
        })
        .catch(error => {
          return Promise.reject('No URL given');
        });


        // return new Promise((resolve, reject) => {
        //
        //     if (this.iliasObject.link) {
        //
        //         const link = this.linkRewriter.rewrite(this.iliasObject.link);
        //         console.log(link);
        //
        //
        //         new InAppBrowser(link, '_system');
        //         resolve(new ILIASObjectActionNoMessage());
        //     } else {
        //         reject('No URL given')
        //     }
        // });
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }
}
