/* angular */
import {Component, Inject} from "@angular/core";
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from "@ionic-native/in-app-browser/ngx";
import {NavController} from "@ionic/angular";
import { ViewWillEnter } from "ionic-lifecycle-interface";
import { ConfigProvider, CONFIG_PROVIDER, ILIASInstallation } from "src/app/config/ilias-config";
import { User } from "src/app/models/user";
/* misc */
import {AuthenticationProvider} from "../../providers/authentication.provider";
import { Optional } from "../../util/util.optional";

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
export class MenuPage implements ViewWillEnter {

    privacyPolicy: string = "datenschutz";
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
    ) {}

    async ionViewWillEnter(): Promise<void> {
        const $installation: Optional<Readonly<ILIASInstallation>> | Readonly<ILIASInstallation>= await this.config.getInstallation();
        const currentUser: User = AuthenticationProvider.getUser();

        const installation: Readonly<ILIASInstallation> = await $installation.orElseGet(async () => {
            const install: Optional<Readonly<ILIASInstallation>> = await this.config.loadInstallation(currentUser.installationId);

            return install.get();
        });

        this.privacyPolicy = installation.privacyPolicy;
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
