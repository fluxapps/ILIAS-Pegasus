import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TextBlock } from "./textblock/textblock.component"
import { PictureBlock } from "./pictureblock/pictureblock.component"
import { VideoBlock } from "./videoblock/videoblock.component"
import { LinkBlock } from "./linkblock/link-block.component"
import { AccordionBlock } from "./accordion/accordion.component"
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
        TextBlock,
        PictureBlock,
        VideoBlock,
        LinkBlock,
        AccordionBlock
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    exports: [
        TextBlock,
        PictureBlock,
        VideoBlock,
        LinkBlock,
        AccordionBlock
    ]
})
export class BlockModule { }
