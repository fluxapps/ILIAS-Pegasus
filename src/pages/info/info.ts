import {Component} from "@angular/core";
import {NavController, IonicPage, NavParams} from "ionic-angular";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {LinkBuilder} from "../../services/link/link-builder.service";
import {BrandingProvider} from "../../providers/branding";


/*
  Generated class for the InfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: "page-info",
  templateUrl: "info.html",
})
export class InfoPage {

  tab: string = "info";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private readonly browser: InAppBrowser,
    private readonly theme: BrandingProvider,
  ) {}

  // call(number) {
  //   (<any> window).location = number;
  // }

  browse(page) {
    this.browser.create(page, "_system");
  }
}
