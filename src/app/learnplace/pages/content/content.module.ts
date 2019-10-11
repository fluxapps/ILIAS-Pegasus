/** angular */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Routes, RouterModule} from "@angular/router";
import {IonicModule} from "@ionic/angular";
/** misc */
import {ContentPage} from "./content.component";
import {TranslateModule} from "@ngx-translate/core";
import {TextBlock} from "../../directives/textblock/textblock.directive";
import {PictureBlock} from "../../directives/pictureblock/pictureblock.directive";
import {VideoBlock} from "../../directives/videoblock/videoblock.directive";
import {LinkBlock} from "../../directives/linkblock/link-block.directive";
import {AccordionBlock} from "../../directives/accordion/accordion.directive";
import {
    AccordionMapper,
    LinkBlockMapper,
    PictureBlockMapper,
    TextBlockMapper,
    VideoBlockMapper,
    VisitJournalMapper
} from "../../services/loader/mappers";
import {BLOCK_SERVICE, VisibilityManagedBlockService} from "../../services/block.service";

const routes: Routes = [
    {path: "", component: ContentPage}
];

@NgModule({
    declarations: [
        ContentPage,
        TextBlock,
        PictureBlock,
        VideoBlock,
        LinkBlock,
        AccordionBlock,
    ],
    providers: [
        // from src/learnplace/services/loader/mappers
        TextBlockMapper,
        PictureBlockMapper,
        LinkBlockMapper,
        VideoBlockMapper,
        AccordionMapper,
        VisitJournalMapper,
        {
            provide: BLOCK_SERVICE,
            useClass: VisibilityManagedBlockService
        },
    ],
    imports: [
        TranslateModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
})
export class ContentPageModule {}
