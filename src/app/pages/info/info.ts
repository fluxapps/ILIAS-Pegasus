/** angular */
import {Component} from "@angular/core";
/** ionic-native */
import {InAppBrowser} from "@ionic-native/in-app-browser/ngx";
import {AppVersion} from "@ionic-native/app-version/ngx";

/*
  Generated class for the InfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: "page-info",
  templateUrl: "info.html",
  styleUrls: ["info.scss"]
})
export class InfoPage {

  tab: string = "info";
  readonly version: Promise<string>;
  readonly versionCode: Promise<string | number>;
  readonly appName: Promise<string>;

  constructor(
    private readonly browser: InAppBrowser,
    private readonly appVersion: AppVersion,
  ) {
      this.version = this.appVersion.getVersionNumber();
      this.versionCode = this.appVersion.getVersionCode();
      this.appName = this.appVersion.getAppName();
  }

  // call(number) {
  //   (<any> window).location = number;
  // }

  browse(page: string): void {
    this.browser.create(page, "_system");
  }
}
