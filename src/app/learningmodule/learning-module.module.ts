import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {IonicModule} from "@ionic/angular";

const routes: Routes = [
    {path: "sahs", loadChildren: () => import('./pages/scorm/scorm.module').then(m => m.ScormPageModule)},
    {path: "htlm", loadChildren: () => import('./pages/htlm/htlm.module').then(m => m.HtlmPageModule)},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
    ]
})
export class LearningModuleModule {}
