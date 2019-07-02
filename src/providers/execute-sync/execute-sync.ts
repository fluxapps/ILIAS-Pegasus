/** angular */
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Modal, ModalController} from "ionic-angular";
/** services */
import {SynchronizationService} from "../../services/synchronization.service";
import {FooterToolbarService, Job} from "../../services/footer-toolbar.service";
import {Log} from "../../services/log.service";
import {Logger} from "../../services/logging/logging.api";
import {Logging} from "../../services/logging/logging.service";
/** misc */
import {TranslateService} from "@ngx-translate/core";
import {ILIASObject} from "../../models/ilias-object";
import {SynchronizationPage} from "../../app/fallback/synchronization/synchronization.component";

/*
  Generated class for the ExecuteSyncProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
    providedIn: "root"
})
export class ExecuteSyncProvider {

  objects: Array<ILIASObject> = [];

    /**
     * The parent container object that was clicked to display the current objects
     */
    parent: ILIASObject;
    private readonly log: Logger = Logging.getLogger(ExecuteSyncProvider.name);


  constructor(public http: HttpClient,
              private readonly sync: SynchronizationService,
              private readonly footerToolbar: FooterToolbarService,
              private readonly translate: TranslateService,
              private readonly modal: ModalController,

              
    ) {
    console.log("Hello ExecuteSyncProvider");
  }

    async executeSync(): Promise<void> {

      try {
          if (SynchronizationService.state.recursiveSyncRunning) {
              this.log.debug(() => "Unable to sync because sync is already running.");
              return;
          }
          const syncModal: Modal = this.displaySyncScreen();
          Log.write(this, "Sync start", [], []);
          this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));

          await this.sync.liveLoad();
          this.footerToolbar.removeJob(Job.Synchronize);
          this.hideSyncScreen(syncModal);
      } catch (error) {
          Log.error(this, error);
          this.footerToolbar.removeJob(Job.Synchronize);
          throw error;
      }
  }

  displaySyncScreen(): Modal {
    if(this.objects.length)
        return undefined;

    const syncModal: Modal = this.modal.create(SynchronizationPage, {}, {enableBackdropDismiss: false});
    syncModal.present();
    return syncModal;
}

hideSyncScreen(syncModal: Modal): void {
    if(syncModal)
        syncModal.dismiss();
}

}
