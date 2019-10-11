import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IonicModule} from "@ionic/angular";

const routes: Routes = [
    {path: "", loadChildren: "./pages/learnplace-tabs/learnplace-tabs.module#LearnplaceTabsPageModule"}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class LearnplaceModule {}
