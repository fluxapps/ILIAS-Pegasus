import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {TextBlockModel} from "../../services/block.model";
import {Observable} from "rxjs/Observable";

@Component({
  selector: "text-block",
  templateUrl: "text-block.html"
})
export class TextBlock implements OnInit {

  @Input("value")
  readonly observableTextBlock: Observable<TextBlockModel>;

  textBlock: TextBlockModel | undefined = undefined;

  constructor(
    private readonly detectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.observableTextBlock.subscribe(it => {
      this.textBlock = it;
      this.detectorRef.detectChanges();
    })
  }
}
