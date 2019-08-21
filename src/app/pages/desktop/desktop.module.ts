/** angular */
import {IonicModule} from "@ionic/angular";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
/** misc */
import {DesktopPage} from "./desktop";


const routes: Routes = [
    {path: "", component: DesktopPage}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [DesktopPage]
})

export class DesktopPageModule {}
