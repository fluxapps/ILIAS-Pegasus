import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { ObjectListPage } from "../object-list/object-list";
import { Page } from "ionic-angular/navigation/nav-util";
import {CONFIG_PROVIDER, ILIASConfigProvider, ILIASInstallation} from "../../config/ilias-config";
import { BrandingProvider } from "../../providers/branding";

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
  readonly installations: Array<ILIASInstallation> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private readonly theme: BrandingProvider,) {
  }

  async switchTabs(tab: number): Promise<void> {
      this.navCtrl.parent.select(tab);
    }
  async openILIASRepository(): Promise<void>{
    //Open repo in Browser inApp for iOS, external for Android

  }

}
