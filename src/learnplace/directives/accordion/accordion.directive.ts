import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {AccordionBlockModel} from "../../services/block.model";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Subscription} from "rxjs/Subscription";
import {isDefined} from "ionic-angular/es2015/util/util";

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
      transition("0 <=> 1", animate(".5s")),
    ])
  ]
})
export class AccordionBlock implements OnInit, OnDestroy {

  @Input("value")
  readonly accordion: AccordionBlockModel;

  private expanded: boolean = false;

  private accordionSubscription?: Subscription;

  constructor(
    private readonly detectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
      this.expanded = this.accordion.expanded;
      this.accordionSubscription = this.accordion.blocks.subscribe(_ => this.detectorRef.detectChanges())
  }

  ngOnDestroy(): void {
    if(isDefined(this.accordionSubscription))
      this.accordionSubscription.unsubscribe();
  }

  toggle(): void { this.expanded = !this.expanded }
}
