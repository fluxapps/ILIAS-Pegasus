import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { InfoPage } from "./info";
import { TranslateModule } from "ng2-translate";

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
