/** angular */
import {IonicModule} from "@ionic/angular";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
/** misc */
import {ScormPage} from "./scorm";
import { TranslateModule } from "@ngx-translate/core";


const routes: Routes = [
    {path: "", component: ScormPage, pathMatch: "full"}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        RouterModule.forChild(routes)
    ],
    declarations: [ScormPage]
})

export class ScormPageModule {}
