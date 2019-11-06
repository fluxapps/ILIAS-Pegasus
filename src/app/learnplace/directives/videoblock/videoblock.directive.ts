import {Component, Inject, Input, OnDestroy, OnInit} from "@angular/core";
import {File} from "@ionic-native/file/ngx";
import {Platform} from "@ionic/angular";
import {Subscription} from "rxjs/Subscription";
import {Filesystem, FILESYSTEM_TOKEN} from "../../../services/filesystem";
import {isDefined} from "../../../util/util.function";
import {VideoBlockModel} from "../../services/block.model";

@Component({
  selector: "video-block",
  templateUrl: "video-block.html"
})
export class VideoBlock implements OnInit, OnDestroy {

  @Input("value")
  readonly videoBlock: VideoBlockModel;

  private videoBlockSubscription: Subscription | undefined = undefined;

  constructor(
    private readonly platform: Platform,
    private readonly file: File,
    @Inject(FILESYSTEM_TOKEN) private readonly filesystem: Filesystem,
  ) {}


  ngOnInit(): void {
    // this.videoBlockSubscription = this.observableVideoBlock.subscribe(it => {
    //   this.videoBlock = it;
    //   this.detectorRef.detectChanges();
    // })
  }

  ngOnDestroy(): void {
    if(isDefined(this.videoBlockSubscription))
      this.videoBlockSubscription.unsubscribe();
  }

  play(): void {
      this.filesystem.open(this.videoBlock.url);
  }
}
