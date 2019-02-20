import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Modal, ModalController } from "ionic-angular";
import { SynchronizationService, SyncResults } from "../../services/synchronization.service";
import { FooterToolbarService, Job } from "../../services/footer-toolbar.service";
import { TranslateService } from "ng2-translate";
import { SyncFinishedModal } from "../../pages/sync-finished-modal/sync-finished-modal"
import { ILIASObject } from "../../models/ilias-object";
import {SynchronizationPage} from "../../app/fallback/synchronization/synchronization.component";

import {Log} from "../../services/log.service";
import { Logger } from "../../services/logging/logging.api";
import { Logging } from "../../services/logging/logging.service";

/*
  Generated class for the ExecuteSyncProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
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

          if (this.sync.isRunning) {
              this.log.debug(() => "Unable to sync because sync is already running.");
              return;
          }
          const syncModal: Modal = this.displaySyncScreen();
          Log.write(this, "Sync start", [], []);
          this.footerToolbar.addJob(Job.Synchronize, this.translate.instant("synchronisation_in_progress"));

          const syncResult: SyncResults = await this.sync.execute(undefined, true);
          this.calculateChildrenMarkedAsNew();

          // We have some files that were marked but not downloaded. We need to explain why and open a modal.
          if (syncResult.objectsLeftOut.length > 0) {
              const syncModal: Modal = this.modal.create(SyncFinishedModal, {syncResult: syncResult});
              await syncModal.present();
          }

          //maybe some objects came in new.
          this.footerToolbar.removeJob(Job.Synchronize);
          this.hideSyncScreen(syncModal);

      } catch (error) {

          Log.error(this, error);
          this.footerToolbar.removeJob(Job.Synchronize);
          throw error;
      }
  }

   // TODO: Refactor method to make sure it returns a Promise<void>
   private calculateChildrenMarkedAsNew(): void {
    // Container objects marked as offline available display the number of new children as badge
    this.objects.forEach(iliasObject => {
        if (iliasObject.isContainer()) {
            ILIASObject.findByParentRefIdRecursive(iliasObject.refId, iliasObject.userId).then(iliasObjects => {
                const newObjects: Array<ILIASObject> = iliasObjects.filter((iliasObject: ILIASObject) => {
                    return iliasObject.isNew || iliasObject.isUpdated;
                });
                const n: number = newObjects.length;
                Log.describe(this, "Object:", iliasObject);
                Log.describe(this, "Objects marked as new: ", n);
                iliasObject.newSubItems = n;
            });
        } else {
            iliasObject.newSubItems = 0;
        }
    });
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
