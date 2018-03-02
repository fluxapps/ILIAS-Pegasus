import {Component, Input, OnInit} from "@angular/core";
import {AccordionBlockModel} from "../../services/block.model";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: "accordion-block",
  templateUrl: "accordion.html",
  animations: [
    trigger("expanded", [
      state("0", style({
        height: "0px",
        overflow: "hidden"
      })),
      state("1", style({
        height: "*"
      })),
      transition("* => *", animate(".5s"))
    ])
  ]
})
export class AccordionBlock implements OnInit {

  @Input("value")
  readonly accordion: AccordionBlockModel;

  expanded: boolean = false;

  ngOnInit(): void {
    this.expanded = this.accordion.expanded; // sets the default expanded state of the accordion
  }

  toggle(): void { this.expanded = !this.expanded }
}
