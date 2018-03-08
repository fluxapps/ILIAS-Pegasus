import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {AccordionBlockModel} from "../../services/block.model";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Observable} from "rxjs/Observable";

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
  readonly observableAccordion: Observable<AccordionBlockModel>;

  accordion: AccordionBlockModel;
  expanded: boolean = false;

  constructor(
    private readonly detectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.observableAccordion.subscribe(it => {
      this.accordion = it;
      this.expanded = it.expanded; // sets the default expanded state of the accordion
      this.detectorRef.detectChanges();
    });
  }

  toggle(): void { this.expanded = !this.expanded }
}
