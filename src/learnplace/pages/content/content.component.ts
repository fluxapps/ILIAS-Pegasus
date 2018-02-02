import {AfterViewInit, Component, Inject} from "@angular/core";
import {LEARNPLACE, LearnplaceData} from "../../services/learnplace";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";

@Component({
  templateUrl: "content.html"
})
export class ContentPage implements AfterViewInit {

  readonly blockList: Array<BlockModel> = [];

  constructor(
    @Inject(LEARNPLACE) readonly learnplace: LearnplaceData,
    @Inject(BLOCK_SERVICE) private readonly blockService: BlockService
  ) {}

  ngAfterViewInit(): void {
    this.blockService.getBlocks(this.learnplace.getId())
      .then(blocks => this.blockList.push(...blocks));
  }
}
