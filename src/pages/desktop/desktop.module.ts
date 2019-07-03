/** angular */
import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
/** misc */
import {DesktopPage} from "./desktop";

@NgModule({
  declarations: [
    DesktopPage,
  ],
  imports: [
    IonicPageModule.forChild(DesktopPage),
    
  ],
})
export class DesktopPageModule {}
