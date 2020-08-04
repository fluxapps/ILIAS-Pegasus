import { Injectable } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { LeaveAppDialog, LeaveAppDialogNavParams } from "./leave-app.dialog";

@Injectable({
    providedIn: "root"
})
export class LeaveAppDialogService {


    constructor(
        private readonly modalCtrl: ModalController,
    ) {
    }

    async present(): Promise<void> {
        const modal: HTMLIonModalElement = await this.modalCtrl.create({
            component: LeaveAppDialog,
            componentProps: <LeaveAppDialogNavParams>{
                leaveApp: (): Promise<boolean> => modal.dismiss()
            },
            cssClass: "modal-fullscreen"
        });

        await modal.present();
    }
}
