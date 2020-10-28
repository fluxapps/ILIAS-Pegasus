import {AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from "@angular/core";
import {SafeUrl} from "@angular/platform-browser";
import {ILIASObject} from "src/app/models/ilias-object";
import {ILIASObjectPresenter} from "src/app/presenters/object-presenter";
import {ThemeProvider} from "src/app/providers/theme/theme.provider";
import {FeaturePolicyService} from "src/app/services/policy/feature-policy.service";

@Component({
  selector: "app-icon",
  templateUrl: "./il-obj-icon.component.html",
  styleUrls: ["./il-obj-icon.component.scss"],
})
export class IlObjIconComponent implements OnInit, AfterViewInit {
  @Input("presenter") presenter: ILIASObjectPresenter;
  @Input("ilObject") ilObject: ILIASObject;
  @Input("size") size: number;

  @ViewChild("container", {static: false}) container: ElementRef;

  linkIcon: Promise<string | SafeUrl>;
  showSubIcon: boolean;

  constructor(
    private readonly theme: ThemeProvider,
    private readonly featurePolicy: FeaturePolicyService,
    private readonly renderer: Renderer2) {}

  ngOnInit(): void {
    this.linkIcon = this.theme.getIconSrc("overlay")

    this.showSubIcon = this.shouldOpenInIlias();
  }

  ngAfterViewInit(): void {
    if (!this.size) {
      this.renderer.setStyle(this.container.nativeElement, "height", "100%");
      this.renderer.setStyle(this.container.nativeElement, "width", "100%");
    } else {
      this.renderer.setStyle(this.container.nativeElement, "height", `${this.size}em`);
      this.renderer.setStyle(this.container.nativeElement, "width", `${this.size}em`);
    }
  }

  shouldOpenInIlias(): boolean {
    if (!this.ilObject) return false;
    if (!this.featurePolicy.isFeatureAvailable(this.ilObject.type)) return true;
    if (this.ilObject.isLinked()) return true;
    if (this.ilObject.isContainer()) return false;
    if (this.ilObject.isLearnplace()) return false;
    if (this.ilObject.type === "htlm") return false;
    if (this.ilObject.type === "sahs") return false;
    if (this.ilObject.type === "file") return false;

    return true;
  }

}
