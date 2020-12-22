import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { Observable, ReplaySubject } from "rxjs";

export enum NetworkStatus {
    Online,
    Offline
}

@Injectable({
    providedIn: "root"
})
export class NetworkProvider {

    private previousStatus: NetworkStatus = NetworkStatus.Online;
    private _state: ReplaySubject<NetworkStatus> = new ReplaySubject<NetworkStatus>(1)

    readonly state: Observable<NetworkStatus> = this._state.asObservable();

    constructor(
        private readonly network: Network,
    ) {
        this._state.next(network.type !== network.Connection.NONE ? NetworkStatus.Online : NetworkStatus.Offline);
    }

    /**
     * observes the network status and updates on changes
     */
    initNetworkEvents(): void {
        this.network.onDisconnect().subscribe(() => {
            if (this.previousStatus == NetworkStatus.Online) {
                this._state.next(NetworkStatus.Offline);
            }
            this.previousStatus = NetworkStatus.Offline;
        });

        this.network.onConnect().subscribe(() => {
            if (this.previousStatus == NetworkStatus.Offline) {
                this._state.next(NetworkStatus.Online);
            }

            this.previousStatus = NetworkStatus.Online;
        })
    }
}
