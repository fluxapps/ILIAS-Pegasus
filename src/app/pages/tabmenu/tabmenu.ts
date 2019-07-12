/** angular */
import {Component} from "@angular/core";
/** misc */
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "page-tabmenu",
  templateUrl: "tabmenu.html"
})
export class TabmenuPage {
  constructor(
    private readonly translate: TranslateService
  ) { }
}