/** angular */
import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
/** misc */
import {InfoPage} from "./info";
import {TranslateModule} from "@ngx-translate/core";

@NgModule({
  declarations: [
    InfoPage,
  ],
  imports: [
    IonicPageModule.forChild(InfoPage),
    TranslateModule
  ],
})
export class InfoPageModule {}
