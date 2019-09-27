import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {TabsPage} from "./tabs.page";
import {TabsPageRoutingModule} from "./tabs-routing.module";
import {TranslateModule} from "@ngx-translate/core";

const routes: Routes = [
    {path: "", component: TabsPage}
];

@NgModule({
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        TabsPageRoutingModule,
        RouterModule.forChild(routes)
    ],
    declarations: [TabsPage]
})
export class TabsPageModule {}
