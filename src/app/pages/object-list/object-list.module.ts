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
import { IlObjIconComponent } from "src/app/components/icon/il-obj-icon.component";

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
    entryComponents: [IlObjIconComponent],
    declarations: [ObjectListPage]
})
export class ObjectListPageModule {}
