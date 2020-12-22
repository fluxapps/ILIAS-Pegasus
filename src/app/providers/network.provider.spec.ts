import { TestBed } from "@angular/core/testing";
import { Network } from "@ionic-native/network/ngx";
import { createSpyObject } from "../../test.util.spec";

import { NetworkProvider } from "./network.provider";

const mockNetwork = new Network();

describe("NetworkProvider", () => {
    let service: NetworkProvider;

    const spyNetwork: jasmine.SpyObj<Network> = createSpyObject(Network);

    spyNetwork.Connection = {
        UNKNOWN: "",
        ETHERNET: "",
        WIFI: "",
        CELL_2G: "",
        CELL_3G: "",
        CELL_4G: "",
        CELL: "",
        NONE: "none"
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: Network, useValue: spyNetwork},
            ]
        });
        service = TestBed.inject(NetworkProvider);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
