import {Component, Input} from "@angular/core";
import {TextBlockModel} from "../../page.model";

@Component({
  selector: "text-block",
  templateUrl: "text-block.html"
})
export class TextBlock {

  @Input("value")
  textBlock: TextBlockModel
}
