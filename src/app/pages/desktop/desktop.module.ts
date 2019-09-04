/** angular */
import {IonicModule} from "@ionic/angular";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
/** misc */
import {DesktopPage} from "./desktop";
import { TranslateModule } from "@ngx-translate/core";


const routes: Routes = [
    {path: "", component: DesktopPage}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        RouterModule.forChild(routes)
    ],
    declarations: [DesktopPage]
})

export class DesktopPageModule {}
