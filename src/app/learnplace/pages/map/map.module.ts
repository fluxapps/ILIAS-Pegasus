/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {MapPage} from "./map.component";
import {TranslateModule} from "@ngx-translate/core";

const routes: Routes = [
    {path: "", component: MapPage}
];

@NgModule({
    imports: [
        TranslateModule.forChild(),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [MapPage]
})
export class MapPageModule {}
