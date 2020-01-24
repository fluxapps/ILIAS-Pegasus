import {Injectable} from "@angular/core";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser/ngx";

@Injectable()
export class LearningModuleProvider {

    /*
    openSCROMModule(browser: InAppBrowser, source: string): void {
        console.log("opening SCROM-module");
        const browserOptions: InAppBrowserOptions = {
            location: "no", clearsessioncache: "yes", clearcache: "yes", footer:"no"
        };
        LMSProvider.browserObj = browser.create(LMSProvider.SCROM_PLAYER_SOURCE, "_blank", browserOptions);

        LMSProvider.browserObj.on("loadstop").subscribe(() => {
            console.log("event loadstop");
            this.http.get("assets/scorm_cmi/extend_api.js").then(async(script) => {
                console.log("got js-code");
                await LMSProvider.browserObj.executeScript({code: script.text()});
                console.log("modified api");
            });
            LMSProvider.browserObj.executeScript({code:`Run.ManifestByURL("${source}", true)`});
            console.log("manifest done");
        });
    }
    */

    openHTMLModule(browser: InAppBrowser, source: string): void {
        console.log("opening HTML-module");
        const browserOptions: InAppBrowserOptions = {
            location: "no", clearsessioncache: "yes", clearcache: "yes", footer:"yes", closebuttoncaption: "TODO dev"
        };
        browser.create(source, "_blank", browserOptions);
    }
}
