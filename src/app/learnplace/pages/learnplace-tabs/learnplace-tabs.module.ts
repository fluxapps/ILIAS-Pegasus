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
    {path: ":refId", component: LearnplaceTabsPage,
        children: [
            {path: "content", loadChildren: () => import("../content/content.module").then(m => m.ContentPageModule)},
            {path: "map", loadChildren: () =>  import("../map/map.module").then(m => m.MapPageModule)}
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
