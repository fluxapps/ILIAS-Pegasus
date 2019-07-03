/** angular */
import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
/** misc */
import {ObjectListPage} from "../object-list/object-list";
import {TranslateService} from "@ngx-translate/core";

/**
 * Generated class for the TabmenuPage tabs.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-tabmenu",
  templateUrl: "tabmenu.html"
})
export class TabmenuPage {

  tabmenuRoot1: string = "DesktopPage";
  tabmenuRoot2: string = "ObjectListPage";
  tabmenuRoot3: string = "NewsPage";
  tabmenuRoot4: string = "ObjectListPage";
  tabmenuRoot5: string = "MenuPage";

  constructor(
    public navCtrl: NavController,
    private readonly translate: TranslateService,
    // private app: MyApp
    ) {}

    // logout(){
    //   this.app.logout();
    // }
}
