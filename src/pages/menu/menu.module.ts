/** angular */
import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
/** misc */
import {MenuPage} from "./menu";

@NgModule({
  declarations: [
    MenuPage,
  ],
  imports: [
    IonicPageModule.forChild(MenuPage),
  ],
})
export class MenuPageModule {}
