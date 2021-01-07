import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {TextBlockModel} from "../../../services/learnplace/block.model";
import {Subscription} from "rxjs";
import {isDefined} from "../../../util/util.function";

@Component({
  selector: "text-block",
  templateUrl: "text-block.html",
  styleUrls: ["../block.scss"]
})
export class TextBlock implements OnInit, OnDestroy {

  @Input("value")
  readonly textBlock: TextBlockModel;

  private textBlockSubscription: Subscription | undefined = undefined;

  constructor(
    private readonly detectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.textBlockSubscription = this.observableTextBlock.subscribe(it => {
    //   this.textBlock = it;
    //   this.detectorRef.detectChanges();
    // })
  }

  ngOnDestroy(): void {
    if(isDefined(this.textBlockSubscription))
      this.textBlockSubscription.unsubscribe();
  }
}
