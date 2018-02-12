import {Component, Input} from "@angular/core";
import {VideoBlockModel} from "../../services/block.model";

@Component({
  selector: "video-block",
  templateUrl: "video-block.html"
})
export class VideoBlock {

  @Input("value")
  readonly videoBlock: VideoBlockModel
}
