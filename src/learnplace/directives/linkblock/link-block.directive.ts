import {Component, Inject, Input} from "@angular/core";
import {LinkBlockModel} from "../../services/block.model";
import {LINK_BUILDER, LinkBuilder} from "../../../services/link/link-builder.service";
import {
  OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY,
  OpenObjectInILIASAction
} from "../../../actions/open-object-in-ilias-action";
import {Builder} from "../../../services/builder.base";
import {ILIASObjectAction} from "../../../actions/object-action";
import {TranslateService} from "ng2-translate/src/translate.service";

@Component({
  selector: "link-block",
  templateUrl: "link-block.html"
})
export class LinkBlock {

  @Input("value")
  readonly link: LinkBlockModel;

  constructor(
    @Inject(LINK_BUILDER) private readonly linkBuilder: LinkBuilder,
    private readonly translate: TranslateService,
    @Inject(OPEN_OBJECT_IN_ILIAS_ACTION_FACTORY)
    private readonly openInIliasActionFactory: (title: string, urlBuilder: Builder<Promise<string>>) => OpenObjectInILIASAction,
  ){}

  open(): void {

    const action: ILIASObjectAction = this.openInIliasActionFactory(
      this.translate.instant("actions.view_in_ilias"),
      this.linkBuilder.default().target(this.link.refId)
    );

    action.execute();
  }
}
