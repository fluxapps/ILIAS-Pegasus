/* angular */
import {Component} from "@angular/core";
import {NavController} from "@ionic/angular";
/* misc */
import {LogoutProvider} from "../../providers/logout/logout";
import {SettingsPage} from "../settings/settings";

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
    settingsPage: any = SettingsPage;

    constructor(public navCtrl: NavController,  private readonly logoutCtrl: LogoutProvider,) {
    }

    async openPage(page: any): Promise<void> {
        // TODO migration await this.navCtrl.push(page);
    }


    async openPageLazy(page: string): Promise<void> {
        // TODO migration await this.navCtrl.push(page);
    }

    async logout(): Promise<void> {
        await this.logoutCtrl.logout()
    }

    async openPrivacyPolicy(url: string): Promise<void> {
        window.open(url , "_system")
    }
}
