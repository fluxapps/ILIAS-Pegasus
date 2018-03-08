import {ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit} from "@angular/core";
import {LinkBlockModel} from "../../services/block.model";
import {LINK_BUILDER, LinkBuilder} from "../../../services/link/link-builder.service";
import {
  OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY,
  OpenObjectInILIASAction
} from "../../../actions/open-object-in-ilias-action";
import {Builder} from "../../../services/builder.base";
import {ILIASObjectAction} from "../../../actions/object-action";
import {TranslateService} from "ng2-translate/src/translate.service";
import {User} from "../../../models/user";
import {ILIASObject} from "../../../models/ilias-object";
import {Logger} from "../../../services/logging/logging.api";
import {Logging} from "../../../services/logging/logging.service";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {isDefined} from "ionic-angular/es2015/util/util";

@Component({
  selector: "link-block",
  templateUrl: "link-block.html"
})
export class LinkBlock implements OnInit, OnDestroy {

  @Input("value")
  readonly observableLinkBlock: Observable<LinkBlockModel>;

  link: LinkBlockModel | undefined = undefined;
  linkLabel: string | undefined = undefined;

  private linkBlockSubscription: Subscription | undefined = undefined;

  private readonly log: Logger = Logging.getLogger(LinkBlock.name);

  constructor(
    @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
    private readonly translate: TranslateService,
    @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
    private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
    private readonly detectorRef: ChangeDetectorRef
  ){}

  ngOnInit(): void {

    this.linkBlockSubscription = this.observableLinkBlock.subscribe(it => {
      this.link = it;
      this.detectorRef.detectChanges();
    });

    // because the ref id is immutable, we only want to read the objects title once
    this.observableLinkBlock.first().subscribe(it => {

      User.findActiveUser().then(user => {
        return ILIASObject.findByRefId(it.refId, user.id);
      }).then(obj => {
        this.linkLabel = obj.title;
      }).catch(_ => {
        this.log.info(() => `Could not load label for link block with refId: refId=${it.refId}`);
        this.linkLabel = this.translate.instant("learnplace.no-link-label");
      });
    });
  }

  ngOnDestroy(): void {
    if(isDefined(this.linkBlockSubscription)) {
      this.linkBlockSubscription.unsubscribe();
    }
  }

  open(): void {

    const action: ILIASObjectAction = this.openInIliasActionFactory(
      this.translate.instant("actions.view_in_ilias"),
      this.linkBuilder.default().target(this.link.refId)
    );

    action.execute();
  }
}
