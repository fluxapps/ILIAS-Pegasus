import {ILIASObject} from "../models/ilias-object";
import {ILIASObjectAction, ILIASObjectActionAlert} from "./object-action";
import {InAppBrowser} from "ionic-native";
import {ILIASObjectActionResult} from "./object-action";
import {ILIASObjectActionNoMessage} from "./object-action";

export class OpenObjectInILIASAction extends ILIASObjectAction {

    public constructor(public title:string, public iliasObject:ILIASObject) {
        super();
    }

    public execute():Promise<ILIASObjectActionResult> {
        return new Promise((resolve, reject) => {
            if (this.iliasObject.link) {
                new InAppBrowser(this.iliasObject.link, '_system');
                resolve(new ILIASObjectActionNoMessage());
            } else {
                reject('No URL given')
            }
        });
    }

    public alert():ILIASObjectActionAlert|any {
        return null;
    }
}