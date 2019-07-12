/** angular */
import {Component} from "@angular/core";
/** ionic-native */
import {InAppBrowser} from "@ionic-native/in-app-browser/ngx";

/*
  Generated class for the InfoPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: "page-info",
  templateUrl: "info.html",
})
export class InfoPage {

  tab: string = "info";

  constructor(
    private readonly browser: InAppBrowser
  ) {}

  // call(number) {
  //   (<any> window).location = number;
  // }

  browse(page: string): void {
    this.browser.create(page, "_system");
  }
}
