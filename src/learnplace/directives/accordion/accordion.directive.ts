import {Component, Input} from "@angular/core";
import {AccordionBlockModel} from "../../services/block.model";

@Component({
  selector: "accordion-block",
  templateUrl: "accordion.html"
})
export class AccordionBlock {

  @Input("value")
  readonly accordion: AccordionBlockModel
}
