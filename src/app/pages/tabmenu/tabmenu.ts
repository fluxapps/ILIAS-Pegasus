/** angular */
import {Component, NgZone} from "@angular/core";
import {NavController} from "@ionic/angular";

@Component({
  selector: "page-tabmenu",
  templateUrl: "tabmenu.html"
})
export class TabmenuPage {
    constructor(
        private readonly navCtrl: NavController,
        private readonly ngZonge: NgZone
    ) {}

    async navigateTo(url: string): Promise<void> {
        await this.ngZonge.run(() => this.navCtrl.navigateForward(`tabs/${url}`));
    }
}
