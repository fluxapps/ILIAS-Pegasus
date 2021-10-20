import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GeolocationModule } from "../../services/device/geolocation/geolocation.module";

import { IonicModule } from "@ionic/angular";

import { LearnplacePage } from "./learnplace.page";
import { AccordionMapper, LinkBlockMapper, PictureBlockMapper, TextBlockMapper, VideoBlockMapper, VisitJournalMapper } from "src/app/services/learnplace/loader/mappers";
import {BLOCK_SERVICE, VisibilityManagedBlockService} from "../../services/learnplace/block.service";
import { TranslateModule } from "@ngx-translate/core";
import { RouterModule, Routes } from "@angular/router";
import { BlockModule } from "../../components/learnplace/block.module";
import { MapModule } from "../../components/map/map.module";

const routes: Routes = [
    {
        path: ":refId",
        component: LearnplacePage
    }
];
@NgModule({
    declarations: [
        LearnplacePage,
    ],
    providers: [
        TextBlockMapper,
        PictureBlockMapper,
        LinkBlockMapper,
        VideoBlockMapper,
        AccordionMapper,
        VisitJournalMapper,
        {
            provide: BLOCK_SERVICE,
            useClass: VisibilityManagedBlockService
        }
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        GeolocationModule,
        TranslateModule,
        ReactiveFormsModule,
        BlockModule,
        MapModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class LearnplacePageModule {}
