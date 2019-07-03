/** angular */
import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
/** misc */
import { ObjectListPage } from "./object-list";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [
      ObjectListPage,
  ],
  imports: [
    IonicPageModule.forChild(ObjectListPage),
    TranslateModule,
  ],
})
export class ObjectListPageModule {}
