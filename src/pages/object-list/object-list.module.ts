import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ObjectListPage } from "./object-list";
import { TranslateModule } from "ng2-translate";

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
