/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {ObjectListPage} from "./object-list";
import {TranslateModule} from "@ngx-translate/core";
import { IconModule } from "src/app/components/icon/il-obj-icon.module";

const routes: Routes = [
    {path: "", component: ObjectListPage}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        IconModule,
        TranslateModule,
        RouterModule.forChild(routes)
    ],
    declarations: [ObjectListPage]
})
export class ObjectListPageModule {}
