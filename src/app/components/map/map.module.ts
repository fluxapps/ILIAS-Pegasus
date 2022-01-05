import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MapComponent } from "./map.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule, NavParams } from "@ionic/angular";

@NgModule({
    declarations: [MapComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
    ],
    exports: [MapComponent],
    entryComponents: [MapComponent],
    providers: [NavParams]
})
export class MapModule { }
