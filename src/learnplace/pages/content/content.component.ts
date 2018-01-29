import {AfterViewInit, Component, Inject} from "@angular/core";
import {LEARNPLACE, LearnplaceData} from "../../services/learnplace";
import {BlockModel, TextBlockModel} from "../../page.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";

@Component({
  templateUrl: "content.html"
})
export class ContentPage implements AfterViewInit {

  readonly blockList: Array<BlockModel> = [new TextBlockModel(1, "<h1>You can edit <span style=\"color: #2b2301;\">this demo</span> text!</h1>\n" +
    "<h2 style=\"color: #2e6c80;\"><span style=\"color: #333333;\">How to use the editor:</span></h2>\n" +
    "<p>Paste your documents in the visual editor on the left or your HTML code in the source editor in the right. <br /><br />Edit any of the two areas and see the other changing in real time.&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>\n" +
    "<p><strong>Save this link into your bookmarks and share it with your friends. It is all FREE! </strong><br /><strong>Enjoy!</strong></p>\n" +
    "<p><strong>&nbsp;</strong></p>")];

  constructor(
    @Inject(LEARNPLACE) readonly learnplace: LearnplaceData,
    @Inject(BLOCK_SERVICE) private readonly blockService: BlockService
  ) {}

  ngAfterViewInit(): void {
    this.init();
  }

  async init(): Promise<void> {

    // TODO: Show error page on try/catch

    // (await this.blockService.getBlocks(this.learnplace.getId()))
    //   .forEach(it => this.blockList.push(it));
  }

}
