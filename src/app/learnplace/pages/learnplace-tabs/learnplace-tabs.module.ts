/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {LearnplaceTabsPage} from "./learnplace-tabs.component";
import {TranslateModule} from "@ngx-translate/core";

const routes: Routes = [
    {path: "", component: LearnplaceTabsPage,
        children: [
            {path: "", redirectTo: "content"},
            {path: "content", loadChildren: "../content/content.module#ContentPageModule"},
            {path: "map", loadChildren: "../map/map.module#MapPageModule"},
        ]
    }
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
    declarations: [LearnplaceTabsPage],
    exports: [RouterModule]
})
export class LearnplaceTabsPageModule {}
