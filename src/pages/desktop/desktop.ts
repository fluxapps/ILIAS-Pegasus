import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { ObjectListPage } from "../object-list/object-list";
import { Page } from "ionic-angular/navigation/nav-util";

/**
 * Generated class for the DesktopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-desktop",
  templateUrl: "desktop.html",
})
export class DesktopPage {

  objectListPage: Page = ObjectListPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  async switchTabs(tab: number): Promise<void> {
      this.navCtrl.parent.select(tab);
    }

}
