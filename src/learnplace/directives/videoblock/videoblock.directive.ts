import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {VideoBlockModel} from "../../services/block.model";
import {Platform} from "ionic-angular";
import {File} from "@ionic-native/file";
import {StreamingMedia} from "@ionic-native/streaming-media";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {isDefined} from "ionic-angular/es2015/util/util";
import {LinkBuilder} from "../../../services/link/link-builder.service";
import {BrandingProvider} from "../../../providers/branding";

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
    private readonly streaming: StreamingMedia,
    private readonly detectorRef: ChangeDetectorRef,
    private readonly theme: BrandingProvider
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
    this.streaming.playVideo(`${this.getStorageLocation()}${this.videoBlock.url}`);
  }

  private getStorageLocation(): string {
    if (this.platform.is("android")) {
      return this.file.externalApplicationStorageDirectory;
    }
    if (this.platform.is("ios")) {
      return this.file.dataDirectory;
    }

    throw new Error("Unsupported platform. Can not return a storage location.");
  }
}
