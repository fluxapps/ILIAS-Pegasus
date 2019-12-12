/* angular */
import {Component} from "@angular/core";
import {NavController} from "@ionic/angular";
/* misc */
import {AuthenticationProvider} from "../../providers/authentification/authentication.provider";

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

    constructor(public navCtrl: NavController, private readonly auth: AuthenticationProvider) {
    }

    async navigateTo(url: string): Promise<void> {
        await this.navCtrl.navigateForward(`tabs/menu/${url}`);
    }

    async logout(): Promise<void> {
        await this.auth.logout();
    }

    async openPrivacyPolicy(url: string): Promise<void> {
        window.open(url , "_system");
    }
}
