/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {NewsPage} from "./news";
import {TranslateModule} from "@ngx-translate/core";
import { IlObjIconComponent } from "src/app/components/icon/il-obj-icon.component";
import { IconModule } from "src/app/components/icon/il-obj-icon.module";

const routes: Routes = [
    {path: "", component: NewsPage}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        TranslateModule,
        IconModule,
        RouterModule.forChild(routes)
    ],
    entryComponents: [IlObjIconComponent],
    declarations: [NewsPage]
})
export class NewsPageModule {}
