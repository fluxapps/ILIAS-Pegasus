/** angular */
import {IonicModule} from "@ionic/angular";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
/** misc */
import {HtlmPage} from "./htlm";
import { TranslateModule } from "@ngx-translate/core";


const routes: Routes = [
    {path: ":id", component: HtlmPage, pathMatch: "full"}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        RouterModule.forChild(routes)
    ],
    declarations: [HtlmPage]
})

export class HtlmPageModule {}
