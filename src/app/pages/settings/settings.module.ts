/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {SettingsPage} from "./settings";
import {TranslateModule} from "@ngx-translate/core";
import {FileSizePipe} from "../../pipes/fileSize.pipe";

const routes: Routes = [
    {path: "", component: SettingsPage}
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
    declarations: [
        SettingsPage,
        FileSizePipe
    ]
})
export class SettingsPageModule {}
