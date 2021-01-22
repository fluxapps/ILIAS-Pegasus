import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { Events } from "@ionic/angular";

export enum StatusEnum {
    Online,
    Offline
}

@Injectable({
    providedIn: "root"
})
export class NetworkProvider {

    private previousStatus: StatusEnum = StatusEnum.Online;

    constructor(
        private readonly network: Network,
        private readonly eventCtrl: Events
    ) {
    }

    /**
     * observes the network status and updates on changes
     */
    initNetworkEvents(): void {
        this.network.onDisconnect().subscribe(() => {
            if (this.previousStatus == StatusEnum.Online) {
                this.eventCtrl.publish("network:offline");
                this.eventCtrl.publish("network:change");
            }
            this.previousStatus = StatusEnum.Offline;
        });

        this.network.onConnect().subscribe(() => {
            if (this.previousStatus == StatusEnum.Offline) {
                this.eventCtrl.publish("network:online");
                this.eventCtrl.publish("network:change");
            }

            this.previousStatus = StatusEnum.Online;
        })
    }
}
