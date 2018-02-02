import {Component, Input} from "@angular/core";
import {PictureBlockModel} from "../../services/block.model";

@Component({
  selector: "picture-block",
  templateUrl: "picture-block.html"
})
export class PictureBlock {

  @Input("value")
  readonly picture: PictureBlockModel;

  show(): void {

  }
}
