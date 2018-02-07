import {AfterViewInit, Component, Inject} from "@angular/core";
import {BlockModel} from "../../services/block.model";
import {BLOCK_SERVICE, BlockService} from "../../services/block.service";
import {LEARNPLACE, LearnplaceData} from "../../services/loader/learnplace";

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
