import {AfterViewInit, Component, Inject} from "@angular/core";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";
import {NavParams} from "ionic-angular";

@Component({
  templateUrl: "content.html"
})
export class ContentPage implements AfterViewInit {

  private readonly learnplaceId: number;
  readonly title: string;
  readonly blockList: Array<BlockModel> = [];

  constructor(
    @Inject(BLOCK_SERVICE) private readonly blockService: BlockService,
    params: NavParams
  ) {
    this.learnplaceId = params.get("learnplaceId");
    this.title = params.get("learnplaceName");
  }

  ngAfterViewInit(): void {
    this.blockService.getBlocks(this.learnplaceId)
      .then(blocks => this.blockList.push(...blocks));
  }
}

export interface ContentPageParams {
  readonly learnplaceId: number;
  readonly learnplaceName: string;
}
