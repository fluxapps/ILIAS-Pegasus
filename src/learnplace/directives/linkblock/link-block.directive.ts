import {Component, Input} from "@angular/core";
import {LinkBlockModel} from "../../services/block.model";

@Component({
  templateUrl: "link-block.html"
})
export class LinkBlock {

  @Input("value")
  readonly link: LinkBlockModel;

  open(): void {
    throw new Error("This method is not implemented yet");
  }
}
