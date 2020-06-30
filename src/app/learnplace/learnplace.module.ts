import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {GeolocationModule} from "../services/device/geolocation/geolocation.module";

const routes: Routes = [
    {path: "", loadChildren: "./pages/learnplace-tabs/learnplace-tabs.module#LearnplaceTabsPageModule"}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        GeolocationModule
    ],
    exports: [RouterModule]
})
export class LearnplaceModule {}
