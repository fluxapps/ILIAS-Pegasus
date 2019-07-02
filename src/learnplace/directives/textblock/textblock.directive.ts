/** angular */
import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {isDefined} from "ionic-angular/es2015/util/util";
/** misc */
import {TextBlockModel} from "../../services/block.model";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: "text-block",
  templateUrl: "text-block.html"
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
