import {Component} from "@angular/core";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {IonicPage} from "ionic-angular";
import { AppVersion } from "@ionic-native/app-version";

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
  readonly appVersionStr: Promise<string>;

  constructor(
    private readonly browser: InAppBrowser,
    readonly appVersionPlugin: AppVersion
  ) {

    this.appVersionStr = this.appVersionPlugin.getVersionNumber();
  }

  // call(number) {
  //   (<any> window).location = number;
  // }

  browse(page: string): void {
    this.browser.create(page, "_system");
  }
}
