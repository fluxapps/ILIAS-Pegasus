/* angular */
import {Component, Inject} from "@angular/core";
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from "@ionic-native/in-app-browser/ngx";
import {NavController} from "@ionic/angular";
import { ConfigProvider, CONFIG_PROVIDER } from "src/app/config/ilias-config";
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
    styleUrls: ["menu.scss"]
})
export class MenuPage {
    
    readonly privacyPolicy: Promise<string>;
    private readonly BROWSER_OPTIONS: InAppBrowserOptions = {
        location: "no",
        clearsessioncache: "yes",
        clearcache: "yes"
    };

    constructor(
        private readonly navCtrl: NavController,
        private readonly auth: AuthenticationProvider,
        private readonly browser: InAppBrowser,
        @Inject(CONFIG_PROVIDER) private readonly config: ConfigProvider,
    ) {
        this.privacyPolicy = config.loadInstallation(AuthenticationProvider.getUser().installationId).then(installation => {
            return installation.privacyPolicy;
        })
    }

    async navigateTo(url: string): Promise<void> {
        await this.navCtrl.navigateForward(`tabs/menu/${url}`);
    }

    async logout(): Promise<void> {
        await this.auth.logout();
    }

    async openPrivacyPolicy(url: Promise<string>): Promise<void> {
        const browserSession: InAppBrowserObject = this.browser.create(await url, "_blank", this.BROWSER_OPTIONS);
        browserSession.show();
    }
}
