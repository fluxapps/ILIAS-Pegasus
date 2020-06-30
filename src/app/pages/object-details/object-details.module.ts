/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {ObjectDetailsPage} from "./object-details";
import {TranslateModule} from "@ngx-translate/core";

const routes: Routes = [
    {path: "", component: ObjectDetailsPage}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        TranslateModule,
        RouterModule.forChild(routes)
    ],
    declarations: [ObjectDetailsPage]
})
export class ObjectDetailsPageModule {}
