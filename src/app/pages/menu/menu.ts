/* angular */
import {Component} from "@angular/core";
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from "@ionic-native/in-app-browser/ngx";
import {NavController} from "@ionic/angular";
/* misc */
import {AuthenticationProvider} from "../../providers/authentication.provider";

/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
    selector: "page-menu",
    templateUrl: "menu.html",
})
export class MenuPage {

    private readonly BROWSER_OPTIONS: InAppBrowserOptions = {
        location: "no",
        clearsessioncache: "yes",
        clearcache: "yes"
    };

    constructor(
        private readonly navCtrl: NavController,
        private readonly auth: AuthenticationProvider,
        private readonly browser: InAppBrowser,
    ) {
    }

    async navigateTo(url: string): Promise<void> {
        await this.navCtrl.navigateForward(`tabs/menu/${url}`);
    }

    async logout(): Promise<void> {
        await this.auth.logout();
    }

    async openPrivacyPolicy(url: string): Promise<void> {
        const browserSession: InAppBrowserObject = this.browser.create(url, "_blank", this.BROWSER_OPTIONS);
        browserSession.show();
    }
}
