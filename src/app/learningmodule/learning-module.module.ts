import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {IonicModule} from "@ionic/angular";

const routes: Routes = [
    {path: "", loadChildren: "./pages/scorm/scorm.module#ScormPageModule"},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule],
})
export class LearningModuleModule {}
