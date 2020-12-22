import {Component, Inject} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {NavController} from "@ionic/angular";
import {ViewDidLeave, ViewWillEnter} from "ionic-lifecycle-interface";
import { ILIASObject } from "src/app/models/ilias-object";
import { AuthenticationProvider } from "src/app/providers/authentication.provider";
import {Hardware} from "../../../services/device/hardware-features/hardware-feature.service";
import {VISIT_JOURNAL_WATCH, VisitJournalWatch} from "../../services/visitjournal.service";

@Component({
    templateUrl: "learnplace-tabs.html",
    styleUrls: ["learnplace-tabs.scss"]
})
export class LearnplaceTabsPage implements ViewWillEnter, ViewDidLeave {

    title: string;
    lpRefId: number;

    constructor(
        private readonly hardware: Hardware,
        private readonly nav: NavController,
        private readonly route: ActivatedRoute,
        @Inject(VISIT_JOURNAL_WATCH) private readonly visitJournalWatch: VisitJournalWatch
    ) { }

    async ionViewWillEnter(): Promise<void> {
        this.lpRefId = Number.parseInt(this.route.snapshot.paramMap.get("refId"));

        const ilObj: ILIASObject = await ILIASObject.findByRefIdAndUserId(this.lpRefId, AuthenticationProvider.getUser().id);
        this.title = ilObj.title;
        this.visitJournalWatch.setLearnplace(ilObj.objId);
        this.visitJournalWatch.start();
        this.hardware.requireLocation()
            .onFailure(() => this.nav.pop())
            .check();
    }

    ionViewDidLeave(): void {
        this.visitJournalWatch.stop();
    }

    async navigate(page: "map" | "content"): Promise<void> {
        await this.nav.navigateForward(["learnplace", this.lpRefId, page]);
    }
}
